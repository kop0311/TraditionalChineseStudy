// HanziWriter 写字练习JavaScript

class HanziWritingPractice {
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
        
        // 等待HanziWriter加载
        if (typeof HanziWriter === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
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
                    <div id="${writerId}"></div>
                </div>
                <div class="writing-controls">
                    <button class="btn btn-primary btn-sm" data-action="animate" data-index="${index}">
                        ▶️ 演示笔顺
                    </button>
                    <button class="btn btn-warning btn-sm" data-action="animate-slow" data-index="${index}">
                        🐌 慢速演示
                    </button>
                    <button class="btn btn-secondary btn-sm" data-action="clear" data-index="${index}">
                        🗑️ 重写
                    </button>
                    <button class="btn btn-success btn-sm" data-action="complete" data-index="${index}">
                        ✅ 完成
                    </button>
                </div>
                <div class="stroke-info">
                    <small id="stroke-info-${index}">准备开始练习</small>
                </div>
            `;

            container.appendChild(cardDiv);
            
            // 延迟初始化HanziWriter，确保DOM元素已渲染
            setTimeout(() => {
                this.initializeWriter(index, charInfo, writerId);
            }, 100);
        });
        
        // 添加事件委托
        this.setupEventListeners();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        const container = document.getElementById('character-grid');
        
        // 字符卡片按钮事件
        container.addEventListener('click', (e) => {
            if (e.target.matches('button[data-action]')) {
                const action = e.target.dataset.action;
                const index = parseInt(e.target.dataset.index);
                
                switch(action) {
                    case 'animate':
                        this.animateCharacter(index);
                        break;
                    case 'animate-slow':
                        this.animateSlowCharacter(index);
                        break;
                    case 'clear':
                        this.clearCharacter(index);
                        break;
                    case 'complete':
                        this.markCompleted(index);
                        break;
                }
            }
        });
        
        // 模式按钮事件
        const modeButtons = document.querySelector('.mode-buttons');
        if (modeButtons) {
            modeButtons.addEventListener('click', (e) => {
                if (e.target.matches('button[data-mode]')) {
                    const mode = e.target.dataset.mode;
                    this.setMode(mode);
                } else if (e.target.matches('button[data-action]')) {
                    const action = e.target.dataset.action;
                    switch(action) {
                        case 'show-all':
                            this.showAll();
                            break;
                        case 'animate-all':
                            this.animateAll();
                            break;
                    }
                }
            });
        }
    }

    // 初始化HanziWriter
    initializeWriter(index, charInfo, writerId) {
        if (typeof HanziWriter === 'undefined') {
            this.updateStrokeInfo(index, 'HanziWriter未加载');
            return;
        }

        try {
            const writer = HanziWriter.create(writerId, charInfo.simp_char, {
                width: 200,
                height: 200,
                padding: 10,
                strokeColor: '#4CAF50',
                radicalColor: '#FF9800',
                outlineColor: '#e0e0e0',
                charColor: '#ddd',
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 300,
                
                // 显示设置
                showOutline: true,
                showCharacter: false,
                
                // 启用鼠标和触摸交互
                showHintAfterMisses: 2,
                highlightOnComplete: true,
                drawingColor: '#2E7D32',
                drawingWidth: 4,
                
                // 回调函数
                onLoadCharDataSuccess: () => {
                    this.updateStrokeInfo(index, `${charInfo.simp_char} - 准备练习`);
                },
                onLoadCharDataError: (err) => {
                    this.updateStrokeInfo(index, '字符数据加载失败');
                    console.warn('HanziWriter load error:', err);
                },
                onCorrectStroke: (strokeData) => {
                    this.updateStrokeInfo(index, `第 ${strokeData.strokeNum + 1} 笔正确！继续加油！`);
                },
                onMistake: (strokeData) => {
                    this.updateStrokeInfo(index, `第 ${strokeData.strokeNum + 1} 笔需要重写，再试一次`);
                },
                onComplete: () => {
                    this.updateStrokeInfo(index, '🎉 太棒了！字写完了！');
                    setTimeout(() => {
                        this.markCompleted(index);
                    }, 1000);
                }
            });

            this.writers.set(index, writer);
            this.setWriterMode(writer, this.currentMode);
            
        } catch (error) {
            console.error('Error initializing HanziWriter:', error);
            this.updateStrokeInfo(index, '无法初始化书写练习');
        }
    }

    // 设置HanziWriter模式
    setWriterMode(writer, mode) {
        if (!writer) return;
        
        // 取消当前quiz模式
        if (writer.cancelQuiz) {
            writer.cancelQuiz();
        }
        
        switch(mode) {
            case 'stroke':
                writer.showOutline();
                writer.hideCharacter();
                break;
            case 'trace':
                writer.showOutline();
                writer.showCharacter();
                // 启用描红模式 (quiz with outline)
                writer.quiz({
                    showOutline: true,
                    showCharacter: true,
                    onMistake: (strokeData) => {
                        console.log('描红错误:', strokeData);
                    },
                    onCorrectStroke: (strokeData) => {
                        console.log('描红正确:', strokeData.strokeNum + 1);
                    },
                    onComplete: (summaryData) => {
                        console.log('描红完成!', summaryData);
                    }
                });
                break;
            case 'write':
                writer.hideOutline();
                writer.hideCharacter();
                // 启用自由书写模式 (quiz without outline)
                writer.quiz({
                    showOutline: false,
                    showCharacter: false,
                    onMistake: (strokeData) => {
                        console.log('书写错误:', strokeData);
                    },
                    onCorrectStroke: (strokeData) => {
                        console.log('书写正确:', strokeData.strokeNum + 1);
                    },
                    onComplete: (summaryData) => {
                        console.log('书写完成!', summaryData);
                    }
                });
                break;
        }
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
        
        // 更新所有HanziWriter的模式
        this.writers.forEach((writer, index) => {
            this.setWriterMode(writer, mode);
        });

        // 更新UI状态
        document.querySelectorAll('.mode-buttons .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const descriptions = {
            'stroke': '跟随笔顺练习，学习正确写法',
            'trace': '描红练习，在字上描写',
            'write': '自由书写，挑战记忆'
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
            card.style.transform = 'scale(1.02)';
        }
        
        this.updateProgress();
        
        // 添加完成动画
        this.showCompletionAnimation(index);
    }

    // 显示完成动画
    showCompletionAnimation(index) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            // 添加成功图标
            const successIcon = document.createElement('div');
            successIcon.innerHTML = '🎉';
            successIcon.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 2rem;
                animation: bounce 0.6s ease-in-out;
            `;
            
            card.style.position = 'relative';
            card.appendChild(successIcon);
            
            setTimeout(() => {
                if (successIcon.parentNode) {
                    successIcon.remove();
                }
            }, 2000);
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
                this.showCongratulations();
            }, 500);
        }
    }

    // 显示祝贺信息
    showCongratulations() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            " onclick="this.remove()">
                <div style="
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                ">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="color: #4CAF50; margin-bottom: 1rem;">恭喜完成！</h2>
                    <p style="font-size: 1.2rem; color: #666; margin-bottom: 2rem;">
                        你已经完成了所有汉字的练习！<br>
                        继续加油，学习更多汉字吧！
                    </p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="
                                background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
                                color: white;
                                border: none;
                                padding: 12px 30px;
                                border-radius: 25px;
                                font-size: 1.1rem;
                                font-weight: 600;
                                cursor: pointer;
                            ">
                        继续学习
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 显示所有字符
    showAll() {
        this.writers.forEach((writer, index) => {
            if (writer) {
                writer.showCharacter();
                writer.showOutline();
            }
        });
    }

    // 动画演示所有字符
    animateAll() {
        let delay = 0;
        this.writers.forEach((writer, index) => {
            if (writer) {
                setTimeout(() => {
                    writer.animateCharacter();
                    this.updateStrokeInfo(index, '正在演示笔顺...');
                }, delay);
                delay += 2000; // 每个字符间隔2秒
            }
        });
    }
    
    // 单个字符动画
    animateCharacter(index) {
        if (this.writers.has(index)) {
            const writer = this.writers.get(index);
            if (writer) {
                writer.animateCharacter();
                this.updateStrokeInfo(index, '正在演示笔顺...');
            }
        }
    }
    
    // 慢速动画
    animateSlowCharacter(index) {
        if (this.writers.has(index)) {
            const writer = this.writers.get(index);
            if (writer) {
                writer.animateCharacter({
                    strokeAnimationSpeed: 0.3,
                    delayBetweenStrokes: 1000
                });
                this.updateStrokeInfo(index, '正在慢速演示笔顺...');
            }
        }
    }
    
    // 清除字符
    clearCharacter(index) {
        if (this.writers.has(index)) {
            const writer = this.writers.get(index);
            if (writer) {
                writer.clear();
                this.updateStrokeInfo(index, '已清除，可以重新开始');
            }
        }
    }
}

// 添加弹跳动画CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-20px);
        }
        80% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待HanziWriter加载
    const initPractice = () => {
        if (typeof HanziWriter !== 'undefined') {
            window.hanziWritingPractice = new HanziWritingPractice();
        } else {
            setTimeout(initPractice, 100);
        }
    };
    
    initPractice();
});