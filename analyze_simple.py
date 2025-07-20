#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple character analysis script for Traditional Chinese Study
"""

import json
import re
import os
from collections import Counter

def extract_chinese_characters(text):
    """Extract Chinese characters from text"""
    pattern = r'[\u4e00-\u9fff]'
    return re.findall(pattern, text)

def load_json_file(file_path):
    """Load JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def extract_characters_from_classic(data):
    """Extract characters from classic data"""
    characters = set()
    
    if 'chapters' in data:
        for chapter in data['chapters']:
            if 'sentences' in chapter:
                for sentence in chapter['sentences']:
                    if 'simp' in sentence:
                        chars = extract_chinese_characters(sentence['simp'])
                        characters.update(chars)
                    if 'trad' in sentence:
                        chars = extract_chinese_characters(sentence['trad'])
                        characters.update(chars)
    
    return characters

def extract_existing_stroke_characters(stroke_file_path):
    """Extract existing characters from stroke data file"""
    try:
        with open(stroke_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        pattern = r'"([^"]*)":\s*{'
        matches = re.findall(pattern, content)
        
        chinese_chars = set()
        for match in matches:
            if re.match(r'[\u4e00-\u9fff]', match):
                chinese_chars.add(match)
        
        return chinese_chars
    except Exception as e:
        print(f"Error reading stroke data file: {e}")
        return set()

def main():
    base_dir = r"D:\Coding\TraditionalChineseStudy"
    
    # Load data files
    files = {
        "sanzijing": os.path.join(base_dir, "data", "sanzijing.json"),
        "dizigui": os.path.join(base_dir, "data", "dizigui.json"),
        "daodejing": os.path.join(base_dir, "data", "daodejing.json")
    }
    
    stroke_file = os.path.join(base_dir, "public", "js", "stroke-data.js")
    
    print("Character Analysis Report")
    print("=" * 50)
    
    all_characters = set()
    classic_stats = {}
    
    # Analyze each classic
    for name, filepath in files.items():
        print(f"\nAnalyzing {name}...")
        data = load_json_file(filepath)
        
        if data:
            characters = extract_characters_from_classic(data)
            all_characters.update(characters)
            classic_stats[name] = {
                'count': len(characters),
                'characters': characters
            }
            print(f"  Found {len(characters)} unique characters")
    
    print(f"\nTotal unique characters: {len(all_characters)}")
    
    # Analyze existing stroke data
    existing_chars = extract_existing_stroke_characters(stroke_file)
    print(f"Existing stroke data characters: {len(existing_chars)}")
    
    # Compare
    missing_chars = all_characters - existing_chars
    covered_chars = all_characters & existing_chars
    
    print(f"\nCoverage Analysis:")
    print(f"Covered characters: {len(covered_chars)}")
    print(f"Missing characters: {len(missing_chars)}")
    print(f"Coverage rate: {len(covered_chars)/len(all_characters)*100:.2f}%")
    
    # Detail by classic
    print(f"\nDetailed Statistics by Classic:")
    for name, stats in classic_stats.items():
        chars = stats['characters']
        covered = chars & existing_chars
        missing = chars - existing_chars
        print(f"\n{name}:")
        print(f"  Total: {stats['count']}")
        print(f"  Covered: {len(covered)}")
        print(f"  Missing: {len(missing)}")
        print(f"  Coverage: {len(covered)/stats['count']*100:.2f}%")
    
    # Missing characters list
    if missing_chars:
        print(f"\nMissing Characters ({len(missing_chars)} total):")
        sorted_missing = sorted(missing_chars)
        
        # Print in rows of 20
        for i in range(0, len(sorted_missing), 20):
            line_chars = sorted_missing[i:i+20]
            print("  " + " ".join(line_chars))
        
        # Character frequency
        char_frequency = Counter()
        for name, stats in classic_stats.items():
            for char in stats['characters']:
                if char in missing_chars:
                    char_frequency[char] += 1
        
        print(f"\nHigh-priority missing characters (appear in multiple classics):")
        for char, freq in char_frequency.most_common():
            if freq > 1:
                classics = []
                for name, stats in classic_stats.items():
                    if char in stats['characters']:
                        classics.append(name)
                print(f"  {char}: appears in {freq} classics ({', '.join(classics)})")
    
    # Save results
    result_file = os.path.join(base_dir, "character_analysis_result.txt")
    with open(result_file, 'w', encoding='utf-8') as f:
        f.write("Character Analysis Report\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total unique characters: {len(all_characters)}\n")
        f.write(f"Existing stroke data: {len(existing_chars)} characters\n")
        f.write(f"Missing characters: {len(missing_chars)}\n")
        f.write(f"Coverage rate: {len(covered_chars)/len(all_characters)*100:.2f}%\n\n")
        
        for name, stats in classic_stats.items():
            chars = stats['characters']
            covered = chars & existing_chars
            missing = chars - existing_chars
            f.write(f"{name}:\n")
            f.write(f"  Total: {stats['count']}\n")
            f.write(f"  Covered: {len(covered)}\n")
            f.write(f"  Missing: {len(missing)}\n")
            f.write(f"  Coverage: {len(covered)/stats['count']*100:.2f}%\n\n")
        
        if missing_chars:
            f.write(f"Missing Characters ({len(missing_chars)} total):\n")
            sorted_missing = sorted(missing_chars)
            for i in range(0, len(sorted_missing), 20):
                line_chars = sorted_missing[i:i+20]
                f.write(" ".join(line_chars) + "\n")
    
    print(f"\nResults saved to: {result_file}")

if __name__ == "__main__":
    main()