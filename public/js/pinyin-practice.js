// 拼音练习JavaScript

class PinyinPractice {
    constructor() {
        this.currentMode = 'breakdown';
        this.sentenceData = window.sentenceData;
        this.currentSyllableIndex = 0;
        this.isPlaying = false;
        this.init();
    }

    init() {
        this.parsePinyin();
        this.renderPinyinDisplay();
        this.showMode('breakdown');
    }

    // 解析拼音数据
    parsePinyin() {
        if (!this.sentenceData.sentence.pinyin_json) {
            console.warn('No pinyin data available');
            return;
        }

        this.pinyinData = [];
        const chars = this.sentenceData.sentence.simp.split('');
        const pinyins = this.sentenceData.sentence.pinyin_json;

        chars.forEach((char, index) => {
            if (char.match(/[一-龯]/)) { // 只处理汉字
                const pinyin = pinyins[this.pinyinData.length] || '';
                const breakdown = this.breakdownPinyin(pinyin);
                
                this.pinyinData.push({
                    char: char,
                    pinyin: pinyin,
                    ...breakdown
                });
            }
        });
    }

    // 分解拼音为声母、韵母、声调
    breakdownPinyin(pinyin) {
        if (!pinyin) return { initial: '', final: '', tone: '' };

        // 声调映射
        const toneMap = {
            'ā': { base: 'a', tone: '1' }, 'á': { base: 'a', tone: '2' }, 
            'ǎ': { base: 'a', tone: '3' }, 'à': { base: 'a', tone: '4' },
            'ō': { base: 'o', tone: '1' }, 'ó': { base: 'o', tone: '2' }, 
            'ǒ': { base: 'o', tone: '3' }, 'ò': { base: 'o', tone: '4' },
            'ē': { base: 'e', tone: '1' }, 'é': { base: 'e', tone: '2' }, 
            'ě': { base: 'e', tone: '3' }, 'è': { base: 'e', tone: '4' },
            'ī': { base: 'i', tone: '1' }, 'í': { base: 'i', tone: '2' }, 
            'ǐ': { base: 'i', tone: '3' }, 'ì': { base: 'i', tone: '4' },
            'ū': { base: 'u', tone: '1' }, 'ú': { base: 'u', tone: '2' }, 
            'ǔ': { base: 'u', tone: '3' }, 'ù': { base: 'u', tone: '4' },
            'ǖ': { base: 'ü', tone: '1' }, 'ǘ': { base: 'ü', tone: '2' }, 
            'ǚ': { base: 'ü', tone: '3' }, 'ǜ': { base: 'ü', tone: '4' },
            'ń': { base: 'n', tone: '2' }, 'ň': { base: 'n', tone: '3' }, 
            'ǹ': { base: 'n', tone: '4' }
        };

        // 去掉声调，得到基础拼音
        let basePinyin = pinyin;
        let tone = '';
        
        for (let char of pinyin) {
            if (toneMap[char]) {
                basePinyin = basePinyin.replace(char, toneMap[char].base);
                tone = toneMap[char].tone;
                break;
            }
        }

        // 声母列表
        const initials = [
            'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
            'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's'
        ];

        let initial = '';
        let final = basePinyin;

        // 找声母（按长度从长到短匹配）
        const sortedInitials = initials.sort((a, b) => b.length - a.length);
        for (let init of sortedInitials) {
            if (basePinyin.startsWith(init)) {
                initial = init;
                final = basePinyin.substring(init.length);
                break;
            }
        }

        return {
            initial: initial,
            final: final,
            tone: tone,
            fullPinyin: pinyin
        };
    }

    // 渲染拼音显示
    renderPinyinDisplay() {
        const container = document.getElementById('pinyin-display');
        container.innerHTML = '';

        this.pinyinData.forEach((data, index) => {
            const syllableDiv = document.createElement('div');
            syllableDiv.className = 'syllable-container';
            syllableDiv.onclick = () => this.highlightSyllable(index);

            syllableDiv.innerHTML = `
                <div class="chinese-char">${data.char}</div>
                <div class="pinyin-breakdown">
                    <span class="initial">${data.initial}</span><span class="final">${data.final}</span><span class="tone">${data.tone}</span>
                </div>
                <div class="component-label">
                    <small class="initial">声母</small> 
                    <small class="final">韵母</small> 
                    <small class="tone">声调</small>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); playPinyin(${index})">
                        🔊 发音
                    </button>
                </div>
            `;

            container.appendChild(syllableDiv);
        });
    }

    // 高亮显示音节
    highlightSyllable(index) {
        // 移除之前的高亮
        document.querySelectorAll('.syllable-container').forEach(el => {
            el.style.border = '2px solid rgba(76, 175, 80, 0.2)';
            el.style.background = 'rgba(255, 255, 255, 0.9)';
        });

        // 高亮当前音节
        const containers = document.querySelectorAll('.syllable-container');
        if (containers[index]) {
            containers[index].style.border = '3px solid #4CAF50';
            containers[index].style.background = 'rgba(76, 175, 80, 0.1)';
        }

        this.currentSyllableIndex = index;
    }

    // 显示不同模式
    showMode(mode) {
        this.currentMode = mode;
        
        // 更新按钮状态
        document.querySelectorAll('.mode-buttons .btn').forEach(btn => {
            btn.classList.remove('active');
        });

        switch(mode) {
            case 'breakdown':
                this.showBreakdownMode();
                break;
            case 'tone':
                this.showToneMode();
                break;
            case 'speed':
                this.showSpeedMode();
                break;
        }
    }

    showBreakdownMode() {
        // 显示详细的拼音分解
        document.querySelectorAll('.syllable-container').forEach((container, index) => {
            const data = this.pinyinData[index];
            const breakdown = container.querySelector('.pinyin-breakdown');
            breakdown.innerHTML = `
                <div style="margin: 5px 0;">
                    <span class="initial">${data.initial}</span>
                    <span class="final">${data.final}</span>
                    <span class="tone">${data.tone}调</span>
                </div>
                <div style="font-size: 1.2rem; color: #666;">
                    ${data.fullPinyin}
                </div>
            `;
        });
    }

    showToneMode() {
        // 重点显示声调
        document.querySelectorAll('.syllable-container').forEach((container, index) => {
            const data = this.pinyinData[index];
            const breakdown = container.querySelector('.pinyin-breakdown');
            breakdown.innerHTML = `
                <div class="tone" style="font-size: 3rem; margin: 10px 0;">
                    ${data.tone}
                </div>
                <div style="font-size: 1.5rem;">
                    ${data.fullPinyin}
                </div>
                <div style="color: #666; margin-top: 5px;">
                    ${this.getToneDescription(data.tone)}
                </div>
            `;
        });
    }

    showSpeedMode() {
        // 简化显示，便于快速练习
        document.querySelectorAll('.syllable-container').forEach((container, index) => {
            const data = this.pinyinData[index];
            const breakdown = container.querySelector('.pinyin-breakdown');
            breakdown.innerHTML = `
                <div style="font-size: 2rem; color: #333;">
                    ${data.fullPinyin}
                </div>
            `;
        });
    }

    getToneDescription(tone) {
        const descriptions = {
            '1': '第一声 (高平)',
            '2': '第二声 (高升)',
            '3': '第三声 (低降升)',
            '4': '第四声 (高降)',
            '': '轻声'
        };
        return descriptions[tone] || '';
    }

    // 播放全部拼音
    async playAll() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        
        for (let i = 0; i < this.pinyinData.length; i++) {
            this.highlightSyllable(i);
            await this.delay(1000);
        }
        
        this.isPlaying = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 全局函数
function showMode(mode) {
    if (window.pinyinPractice) {
        window.pinyinPractice.showMode(mode);
    }
}

function playAll() {
    if (window.pinyinPractice) {
        window.pinyinPractice.playAll();
    }
}

function playPinyin(index) {
    // 这里可以添加语音合成功能
    console.log('Playing pinyin for index:', index);
    if (window.pinyinPractice) {
        window.pinyinPractice.highlightSyllable(index);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.pinyinPractice = new PinyinPractice();
});