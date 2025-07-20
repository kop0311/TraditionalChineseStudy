#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分析三本经典数据文件中的汉字
提取所有唯一汉字，统计总数，并与现有的笔画数据进行对比
"""

import json
import re
import os
from collections import Counter

def extract_chinese_characters(text):
    """提取文本中的汉字"""
    # 使用正则表达式匹配汉字（包括繁体字）
    pattern = r'[\u4e00-\u9fff]'
    return re.findall(pattern, text)

def load_json_file(file_path):
    """加载JSON文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"加载文件 {file_path} 失败: {e}")
        return None

def extract_characters_from_classic(data):
    """从经典数据中提取汉字"""
    characters = set()
    
    if 'chapters' in data:
        for chapter in data['chapters']:
            if 'sentences' in chapter:
                for sentence in chapter['sentences']:
                    # 从简体和繁体文本中提取汉字
                    if 'simp' in sentence:
                        chars = extract_chinese_characters(sentence['simp'])
                        characters.update(chars)
                    if 'trad' in sentence:
                        chars = extract_chinese_characters(sentence['trad'])
                        characters.update(chars)
    
    return characters

def extract_existing_stroke_characters(stroke_file_path):
    """从笔画数据文件中提取已有的汉字"""
    try:
        with open(stroke_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取 STROKE_DATA 对象中的汉字键
        pattern = r'"([^"]*)":\s*{'
        matches = re.findall(pattern, content)
        
        # 过滤出汉字
        chinese_chars = set()
        for match in matches:
            if re.match(r'[\u4e00-\u9fff]', match):
                chinese_chars.add(match)
        
        return chinese_chars
    except Exception as e:
        print(f"读取笔画数据文件失败: {e}")
        return set()

def main():
    # 文件路径
    base_dir = r"D:\Coding\TraditionalChineseStudy"
    data_files = {
        "sanzijing": os.path.join(base_dir, "data", "sanzijing.json"),
        "dizigui": os.path.join(base_dir, "data", "dizigui.json"),
        "daodejing": os.path.join(base_dir, "data", "daodejing.json")
    }
    stroke_file = os.path.join(base_dir, "public", "js", "stroke-data.js")
    
    print("Analysis Report for Traditional Chinese Study Characters")
    print("="*60)
    
    # 存储所有汉字
    all_characters = set()
    classic_stats = {}
    
    # 分析每个经典
    for classic_name, file_path in data_files.items():
        print(f"正在分析 {classic_name}...")
        data = load_json_file(file_path)
        
        if data:
            characters = extract_characters_from_classic(data)
            all_characters.update(characters)
            classic_stats[classic_name] = {
                'count': len(characters),
                'characters': characters
            }
            print(f"  - {classic_name}: {len(characters)} 个唯一汉字")
        else:
            print(f"  - {classic_name}: 加载失败")
    
    print(f"\n总计唯一汉字数量: {len(all_characters)}")
    
    # 分析现有笔画数据
    print("\n=== 现有笔画数据分析 ===")
    existing_chars = extract_existing_stroke_characters(stroke_file)
    print(f"已有笔画数据的汉字: {len(existing_chars)} 个")
    print(f"已有汉字: {sorted(existing_chars)}")
    
    # 对比分析
    print("\n=== 对比分析 ===")
    missing_chars = all_characters - existing_chars
    covered_chars = all_characters & existing_chars
    
    print(f"已覆盖汉字数量: {len(covered_chars)}")
    print(f"缺失笔画数据的汉字数量: {len(missing_chars)}")
    print(f"覆盖率: {len(covered_chars)/len(all_characters)*100:.2f}%")
    
    # 详细统计
    print("\n=== 各经典详细统计 ===")
    for classic_name, stats in classic_stats.items():
        chars = stats['characters']
        covered = chars & existing_chars
        missing = chars - existing_chars
        print(f"\n{classic_name}:")
        print(f"  总汉字数: {stats['count']}")
        print(f"  已覆盖: {len(covered)} 个")
        print(f"  缺失: {len(missing)} 个")
        print(f"  覆盖率: {len(covered)/stats['count']*100:.2f}%")
        if missing:
            print(f"  缺失汉字: {sorted(missing)}")
    
    # 生成缺失汉字清单
    print("\n=== 缺失笔画数据的汉字清单 ===")
    if missing_chars:
        sorted_missing = sorted(missing_chars)
        print(f"共 {len(sorted_missing)} 个汉字缺失笔画数据:")
        
        # 按行显示，每行20个字符
        for i in range(0, len(sorted_missing), 20):
            line_chars = sorted_missing[i:i+20]
            print("  " + " ".join(line_chars))
        
        # 按出现频率排序
        char_frequency = Counter()
        for classic_name, stats in classic_stats.items():
            for char in stats['characters']:
                if char in missing_chars:
                    char_frequency[char] += 1
        
        print(f"\n按出现频率排序（出现在多个经典中的汉字优先）:")
        for char, freq in char_frequency.most_common():
            classics = []
            for classic_name, stats in classic_stats.items():
                if char in stats['characters']:
                    classics.append(classic_name)
            print(f"  {char}: 出现在 {freq} 个经典中 ({', '.join(classics)})")
    else:
        print("所有汉字都已有笔画数据！")
    
    # 保存结果到文件
    result_file = os.path.join(base_dir, "character_analysis_result.txt")
    with open(result_file, 'w', encoding='utf-8') as f:
        f.write("=== 三本经典汉字分析报告 ===\n\n")
        f.write(f"总计唯一汉字数量: {len(all_characters)}\n")
        f.write(f"已有笔画数据的汉字: {len(existing_chars)} 个\n")
        f.write(f"缺失笔画数据的汉字: {len(missing_chars)} 个\n")
        f.write(f"覆盖率: {len(covered_chars)/len(all_characters)*100:.2f}%\n\n")
        
        f.write("各经典详细统计:\n")
        for classic_name, stats in classic_stats.items():
            chars = stats['characters']
            covered = chars & existing_chars
            missing = chars - existing_chars
            f.write(f"\n{classic_name}:\n")
            f.write(f"  总汉字数: {stats['count']}\n")
            f.write(f"  已覆盖: {len(covered)} 个\n")
            f.write(f"  缺失: {len(missing)} 个\n")
            f.write(f"  覆盖率: {len(covered)/stats['count']*100:.2f}%\n")
            if missing:
                f.write(f"  缺失汉字: {' '.join(sorted(missing))}\n")
        
        if missing_chars:
            f.write(f"\n缺失笔画数据的汉字清单 (共 {len(missing_chars)} 个):\n")
            sorted_missing = sorted(missing_chars)
            for i in range(0, len(sorted_missing), 20):
                line_chars = sorted_missing[i:i+20]
                f.write(" ".join(line_chars) + "\n")
    
    print(f"\n分析结果已保存到: {result_file}")

if __name__ == "__main__":
    main()