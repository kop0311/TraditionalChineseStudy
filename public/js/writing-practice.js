// 写字练习JavaScript

class WritingPractice {
    constructor() {
        this.sentenceData = window.sentenceData;
        this.currentMode = 'stroke';
        this.writers = new Map();
        this.completedChars = new Set();
        this.init();
    }

    init() {
        this.parseCharacters();
        this.renderCharacterGrid();
        this.updateProgress();
    }

    // 解析字符数据
    parseCharacters() {
        this.charData = [];
        const chars = this.sentenceData.sentence.simp.split('');
        
        chars.forEach(char => {
            if (char.match(/[一-龯]/)) { // 只处理汉字
                const charInfo = this.sentenceData.characters.find(c => c.simp_char === char) || {
                    simp_char: char,
                    trad_char: char,
                    stroke_order_json: null,
                    story_html: '暂无字符信息'
                };
                
                this.charData.push(charInfo);
            }
        });
    }

    // 渲染汉字网格
    renderCharacterGrid() {
        const container = document.getElementById('character-grid');
        container.innerHTML = '';

        this.charData.forEach((charInfo, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'character-card';
            cardDiv.dataset.index = index;

            const writerId = `hanzi-writer-${index}`;
            
            cardDiv.innerHTML = `
                <div class="character-display">${charInfo.simp_char}</div>
                <div class="character-info">
                    <div class="character-pinyin">${this.getCharacterPinyin(charInfo.simp_char)}</div>
                    <div class="character-meaning">点击开始练习</div>
                </div>
                <div class="hanzi-writer-container">
                    <div id="${writerId}" style="width: 200px; height: 200px; margin: 0 auto;"></div>
                </div>
                <div class="writing-controls">
                    <button class="btn btn-primary btn-sm" onclick="animateCharacter(${index})">
                        ▶️ 演示笔顺
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="clearCharacter(${index})">
                        🗑️ 重写
                    </button>
                    <button class="btn btn-success btn-sm" onclick="markCompleted(${index})">
                        ✅ 完成
                    </button>
                </div>
                <div class="stroke-info">
                    <small id="stroke-info-${index}">准备开始练习</small>
                </div>
            `;

            container.appendChild(cardDiv);
            
            // 初始化汉字书写器
            this.initializeWriter(index, charInfo, writerId);
        });
    }

    // 初始化汉字书写器
    initializeWriter(index, charInfo, writerId) {
        const writerDiv = document.getElementById(writerId);
        if (!writerDiv) {
            console.warn('Writer div not found');
            return;
        }

        try {
            const animator = new StrokeAnimator(writerDiv, charInfo.simp_char, {
                width: 200,
                height: 200,
                strokeColor: '#4CAF50',
                animationSpeed: 800,
                showGrid: true,
                autoStart: false,
                onComplete: () => {
                    this.updateStrokeInfo(index, '太棒了！笔顺动画完成！');
                }
            });

            this.writers.set(index, animator);
            this.updateStrokeInfo(index, `${charInfo.simp_char} - 准备练习`);
            
        } catch (error) {
            console.error('Error initializing stroke animator:', error);
            this.updateStrokeInfo(index, '无法初始化书写练习');
        }
    }

    // 设置书写器模式
    setWriterMode(animator, mode) {
        // 自定义动画器不需要模式切换
        // 可以在这里添加不同的显示效果
        console.log(`设置模式为: ${mode}`);
    }

    // 获取字符拼音
    getCharacterPinyin(char) {
        if (!this.sentenceData.sentence.pinyin_json) {
            return '';
        }
        
        const chars = this.sentenceData.sentence.simp.split('');
        const pinyins = this.sentenceData.sentence.pinyin_json;
        let pinyinIndex = 0;
        
        for (let i = 0; i < chars.length; i++) {
            if (chars[i].match(/[一-龯]/)) {
                if (chars[i] === char) {
                    return pinyins[pinyinIndex] || '';
                }
                pinyinIndex++;
            }
        }
        
        return '';
    }

    // 更新笔顺信息
    updateStrokeInfo(index, message) {
        const infoElement = document.getElementById(`stroke-info-${index}`);
        if (infoElement) {
            infoElement.textContent = message;
        }
    }

    // 更新练习模式
    setMode(mode) {
        this.currentMode = mode;
        
        // 更新所有书写器的模式
        this.writers.forEach((animator, index) => {
            this.setWriterMode(animator, mode);
        });

        // 更新UI状态
        document.querySelectorAll('.mode-buttons .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const descriptions = {
            'stroke': '观看笔顺动画，学习正确写法',
            'trace': '跟随笔顺练习，记住笔画顺序',
            'write': '独立书写，检验学习成果'
        };
        
        // 更新所有卡片的说明
        document.querySelectorAll('.character-meaning').forEach(el => {
            el.textContent = descriptions[mode] || '点击开始练习';
        });
    }

    // 标记字符完成
    markCompleted(index) {
        this.completedChars.add(index);
        
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.style.border = '3px solid #4CAF50';
            card.style.background = 'rgba(76, 175, 80, 0.1)';
        }
        
        this.updateProgress();
        
        // 添加完成动画
        this.showCompletionAnimation(index);
    }

    // 显示完成动画
    showCompletionAnimation(index) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = '';
            }, 300);
        }
    }

    // 更新进度
    updateProgress() {
        const total = this.charData.length;
        const completed = this.completedChars.size;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        
        document.getElementById('progress-text').textContent = `${completed}/${total}`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        
        // 如果全部完成，显示祝贺
        if (completed === total && total > 0) {
            setTimeout(() => {
                alert('🎉 恭喜！你已经完成了所有汉字的练习！');
            }, 500);
        }
    }

    // 显示所有字符动画
    showAll() {
        this.writers.forEach((animator, index) => {
            setTimeout(() => {
                animator.animate();
            }, index * 1000); // 每个字符延迟1秒开始动画
        });
    }
}

// 全局函数
function setMode(mode) {
    if (window.writingPractice) {
        window.writingPractice.setMode(mode);
    }
}

function animateCharacter(index) {
    if (window.writingPractice && window.writingPractice.writers.has(index)) {
        const animator = window.writingPractice.writers.get(index);
        animator.animate();
        window.writingPractice.updateStrokeInfo(index, '正在演示笔顺...');
    }
}

function clearCharacter(index) {
    if (window.writingPractice && window.writingPractice.writers.has(index)) {
        const animator = window.writingPractice.writers.get(index);
        animator.clear();
        window.writingPractice.updateStrokeInfo(index, '已清除，可以重新开始');
    }
}

function markCompleted(index) {
    if (window.writingPractice) {
        window.writingPractice.markCompleted(index);
    }
}

function showAll() {
    if (window.writingPractice) {
        window.writingPractice.showAll();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.writingPractice = new WritingPractice();
});