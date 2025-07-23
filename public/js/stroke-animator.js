// 自定义笔顺动画器 - 不依赖外部CDN

class StrokeAnimator {
    constructor(container, character, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.character = character;
        this.options = {
            width: 300,
            height: 300,
            strokeColor: '#4CAF50',
            strokeWidth: 8,
            animationSpeed: 1000,
            showGrid: true,
            autoStart: false,
            ...options
        };
        
        this.strokes = [];
        this.currentStroke = 0;
        this.isAnimating = false;
        this.svg = null;
        
        this.init();
    }
    
    init() {
        this.createSVG();
        this.loadCharacterData();
    }
    
    createSVG() {
        this.container.innerHTML = '';
        
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.options.width);
        this.svg.setAttribute('height', this.options.height);
        this.svg.setAttribute('viewBox', '0 0 1024 1024');
        this.svg.style.border = '2px solid #ddd';
        this.svg.style.borderRadius = '10px';
        this.svg.style.background = 'white';
        
        // 添加网格
        if (this.options.showGrid) {
            this.addGrid();
        }
        
        this.container.appendChild(this.svg);
    }
    
    addGrid() {
        const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gridGroup.setAttribute('class', 'grid');
        
        // 十字线
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', '512');
        vLine.setAttribute('y1', '0');
        vLine.setAttribute('x2', '512');
        vLine.setAttribute('y2', '1024');
        vLine.setAttribute('stroke', '#e0e0e0');
        vLine.setAttribute('stroke-width', '2');
        vLine.setAttribute('stroke-dasharray', '10,10');
        
        const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hLine.setAttribute('x1', '0');
        hLine.setAttribute('y1', '512');
        hLine.setAttribute('x2', '1024');
        hLine.setAttribute('y2', '512');
        hLine.setAttribute('stroke', '#e0e0e0');
        hLine.setAttribute('stroke-width', '2');
        hLine.setAttribute('stroke-dasharray', '10,10');
        
        gridGroup.appendChild(vLine);
        gridGroup.appendChild(hLine);
        this.svg.appendChild(gridGroup);
    }
    
    async loadCharacterData() {
        // 优先使用HanziWriter内置数据
        if (typeof HanziWriter !== 'undefined') {
            try {
                this.useHanziWriter();
                return;
            } catch (error) {
                console.warn('HanziWriter failed, falling back to local data:', error);
            }
        }
        
        // 次选使用本地数据
        const localData = window.getStrokeData ? window.getStrokeData(this.character) : null;
        
        if (localData) {
            this.processLocalStrokeData(localData);
            if (this.options.autoStart) {
                this.animate();
            }
            return;
        }
        
        // 最后回退到API
        try {
            const response = await fetch(`/api/characters/${encodeURIComponent(this.character)}`);
            if (!response.ok) {
                throw new Error('Character data not found');
            }
            
            const data = await response.json();
            this.processStrokeData(data);
            
            if (this.options.autoStart) {
                this.animate();
            }
            
        } catch (error) {
            console.warn('Failed to load character data:', error);
            this.showFallback();
        }
    }
    
    processLocalStrokeData(localData) {
        if (localData && localData.strokes) {
            this.strokes = localData.strokes.map(stroke => {
                return this.parseSVGPath(stroke);
            });
            
            this.renderStaticStrokes();
        } else {
            this.showFallback();
        }
    }
    
    processStrokeData(data) {
        if (data.stroke_order_json && data.stroke_order_json.strokes) {
            this.strokes = data.stroke_order_json.strokes.map(stroke => {
                return this.parseSVGPath(stroke);
            });
            
            this.renderStaticStrokes();
        } else {
            this.showFallback();
        }
    }
    
    parseSVGPath(pathString) {
        // 简单的SVG路径解析
        // 支持 M (moveTo) 和 L (lineTo) 命令
        const commands = pathString.match(/[ML][^ML]*/g) || [];
        const points = [];
        
        commands.forEach(cmd => {
            const type = cmd[0];
            const coords = cmd.slice(1).trim().split(/\s+/).map(Number);
            
            if (type === 'M' || type === 'L') {
                points.push({
                    type: type,
                    x: coords[0],
                    y: coords[1]
                });
            }
        });
        
        return points;
    }
    
    renderStaticStrokes() {
        // 移除之前的笔画
        const existingStrokes = this.svg.querySelectorAll('.stroke');
        existingStrokes.forEach(stroke => stroke.remove());
        
        // 渲染所有笔画（静态）
        this.strokes.forEach((stroke, index) => {
            const path = this.createStrokePath(stroke, index);
            path.style.opacity = '0.3';
            this.svg.appendChild(path);
        });
        
        // 显示汉字
        this.showCharacter();
    }
    
    createStrokePath(strokePoints, index) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        let pathData = '';
        strokePoints.forEach((point, i) => {
            pathData += `${point.type} ${point.x} ${point.y} `;
        });
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', this.options.strokeColor);
        path.setAttribute('stroke-width', this.options.strokeWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('fill', 'none');
        path.setAttribute('class', 'stroke');
        path.setAttribute('data-stroke', index);
        
        return path;
    }
    
    showCharacter() {
        // 在中心显示汉字
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '512');
        text.setAttribute('y', '600');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '200');
        text.setAttribute('font-family', 'serif');
        text.setAttribute('fill', '#ccc');
        text.setAttribute('class', 'character-background');
        text.textContent = this.character;
        
        this.svg.appendChild(text);
    }
    
    async animate() {
        if (this.isAnimating || this.strokes.length === 0) return;
        
        this.isAnimating = true;
        this.currentStroke = 0;
        
        // 清除之前的动画笔画
        const animatedStrokes = this.svg.querySelectorAll('.animated-stroke');
        animatedStrokes.forEach(stroke => stroke.remove());
        
        for (let i = 0; i < this.strokes.length; i++) {
            await this.animateStroke(i);
            await this.delay(200); // 笔画间停顿
        }
        
        this.isAnimating = false;
        
        // 触发完成事件
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }
    
    async animateStroke(strokeIndex) {
        const stroke = this.strokes[strokeIndex];
        const path = this.createStrokePath(stroke, strokeIndex);
        
        path.setAttribute('class', 'animated-stroke');
        path.style.opacity = '1';
        path.style.strokeDasharray = '2000';
        path.style.strokeDashoffset = '2000';
        path.style.animation = `drawStroke ${this.options.animationSpeed / 1000}s ease-in-out forwards`;
        
        this.svg.appendChild(path);
        
        return this.delay(this.options.animationSpeed);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    useHanziWriter() {
        // 使用HanziWriter替代自定义动画
        this.container.innerHTML = '';
        
        const writerDiv = document.createElement('div');
        writerDiv.style.width = this.options.width + 'px';
        writerDiv.style.height = this.options.height + 'px';
        this.container.appendChild(writerDiv);
        
        const writer = HanziWriter.create(writerDiv, this.character, {
            width: this.options.width,
            height: this.options.height,
            padding: 20,
            strokeColor: this.options.strokeColor,
            strokeAnimationSpeed: this.options.animationSpeed / 1000,
            delayBetweenStrokes: 300,
            showOutline: true,
            showCharacter: false,
            onLoadCharDataError: () => {
                throw new Error('HanziWriter character data not found');
            }
        });
        
        if (this.options.autoStart) {
            setTimeout(() => {
                writer.animateCharacter();
            }, 500);
        }
        
        // 保存writer引用以便后续控制
        this.hanziWriter = writer;
    }

    showFallback() {
        // 显示静态汉字作为备选方案
        this.svg.innerHTML = '';
        this.addGrid();
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '512');
        text.setAttribute('y', '600');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '300');
        text.setAttribute('font-family', 'serif');
        text.setAttribute('fill', this.options.strokeColor);
        text.textContent = this.character;
        
        this.svg.appendChild(text);
        
        // 添加说明文字
        const info = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        info.setAttribute('x', '512');
        info.setAttribute('y', '900');
        info.setAttribute('text-anchor', 'middle');
        info.setAttribute('font-size', '48');
        info.setAttribute('fill', '#666');
        info.textContent = '笔顺数据不可用';
        
        this.svg.appendChild(info);
    }
    
    clear() {
        if (this.hanziWriter) {
            this.hanziWriter.clear();
        } else {
            const animatedStrokes = this.svg.querySelectorAll('.animated-stroke');
            animatedStrokes.forEach(stroke => stroke.remove());
        }
    }
    
    reset() {
        this.clear();
        this.currentStroke = 0;
        this.isAnimating = false;
    }
    
    animate() {
        if (this.hanziWriter) {
            this.hanziWriter.animateCharacter();
        } else {
            return super.animate ? super.animate() : this.animateStrokes();
        }
    }
    
    async animateStrokes() {
        if (this.isAnimating || this.strokes.length === 0) return;
        
        this.isAnimating = true;
        this.currentStroke = 0;
        
        // 清除之前的动画笔画
        const animatedStrokes = this.svg.querySelectorAll('.animated-stroke');
        animatedStrokes.forEach(stroke => stroke.remove());
        
        for (let i = 0; i < this.strokes.length; i++) {
            await this.animateStroke(i);
            await this.delay(200); // 笔画间停顿
        }
        
        this.isAnimating = false;
        
        // 触发完成事件
        if (this.options.onComplete) {
            this.options.onComplete();
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes drawStroke {
        to {
            stroke-dashoffset: 0;
        }
    }
`;
document.head.appendChild(style);

// 全局导出
window.StrokeAnimator = StrokeAnimator;