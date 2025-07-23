/**
 * 增强版汉字笔顺动画器
 * 支持多种数据源和优雅降级
 * @version 2.0.0
 */

class EnhancedStrokeAnimator {
    constructor(containerId, character, options = {}) {
        this.container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;
        
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }
        
        this.character = character;
        this.options = {
            width: 300,
            height: 300,
            strokeColor: '#4CAF50',
            strokeWidth: 8,
            animationSpeed: 1000,
            showGrid: true,
            showOutline: true,
            showCharacter: false,
            autoStart: false,
            padding: 20,
            delayBetweenStrokes: 300,
            ...options
        };
        
        this.isLoaded = false;
        this.isAnimating = false;
        this.currentWriter = null;
        this.fallbackSVG = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoading();
            
            // 尝试使用 HanziWriter CDN
            if (await this.tryHanziWriter()) {
                this.logSuccess('HanziWriter CDN loaded successfully');
                return;
            }
            
            // 回退到本地笔顺数据
            if (await this.tryLocalData()) {
                this.logSuccess('Local stroke data loaded');
                return;
            }
            
            // 回退到 API
            if (await this.tryAPI()) {
                this.logSuccess('API data loaded');
                return;
            }
            
            // 最终回退：显示静态字符
            this.showStaticFallback();
            this.logWarning('Showing static character as fallback');
            
        } catch (error) {
            this.logError('Initialization failed:', error);
            this.showErrorFallback();
        }
    }
    
    async tryHanziWriter() {
        return new Promise((resolve) => {
            // 检查 HanziWriter 是否可用
            if (typeof HanziWriter === 'undefined') {
                this.logWarning('HanziWriter not available');
                resolve(false);
                return;
            }
            
            try {
                this.container.innerHTML = '';
                
                const writerDiv = document.createElement('div');
                writerDiv.style.width = this.options.width + 'px';
                writerDiv.style.height = this.options.height + 'px';
                this.container.appendChild(writerDiv);
                
                this.currentWriter = HanziWriter.create(writerDiv, this.character, {
                    width: this.options.width,
                    height: this.options.height,
                    padding: this.options.padding,
                    strokeColor: this.options.strokeColor,
                    strokeAnimationSpeed: this.options.animationSpeed / 1000,
                    delayBetweenStrokes: this.options.delayBetweenStrokes,
                    showOutline: this.options.showOutline,
                    showCharacter: this.options.showCharacter,
                    onLoadCharDataSuccess: () => {
                        this.isLoaded = true;
                        this.addControls();
                        if (this.options.autoStart) {
                            setTimeout(() => this.animate(), 500);
                        }
                        resolve(true);
                    },
                    onLoadCharDataError: (error) => {
                        this.logWarning('HanziWriter data load failed:', error);
                        resolve(false);
                    }
                });
                
                // 超时处理
                setTimeout(() => {
                    if (!this.isLoaded) {
                        this.logWarning('HanziWriter load timeout');
                        resolve(false);
                    }
                }, 5000);
                
            } catch (error) {
                this.logError('HanziWriter initialization error:', error);
                resolve(false);
            }
        });
    }
    
    async tryLocalData() {
        return new Promise((resolve) => {
            try {
                const strokeData = window.getStrokeData ? window.getStrokeData(this.character) : null;
                
                if (!strokeData || !strokeData.strokes) {
                    this.logWarning('Local stroke data not found for:', this.character);
                    resolve(false);
                    return;
                }
                
                this.createCustomSVG(strokeData);
                this.isLoaded = true;
                this.addControls();
                
                if (this.options.autoStart) {
                    setTimeout(() => this.animate(), 500);
                }
                
                resolve(true);
                
            } catch (error) {
                this.logError('Local data processing error:', error);
                resolve(false);
            }
        });
    }
    
    async tryAPI() {
        return new Promise(async (resolve) => {
            try {
                const response = await fetch(`/api/characters/${encodeURIComponent(this.character)}`);
                
                if (!response.ok) {
                    this.logWarning('API request failed:', response.status);
                    resolve(false);
                    return;
                }
                
                const data = await response.json();
                
                if (data.stroke_order_json && data.stroke_order_json.strokes) {
                    this.createCustomSVG(data.stroke_order_json);
                    this.isLoaded = true;
                    this.addControls();
                    
                    if (this.options.autoStart) {
                        setTimeout(() => this.animate(), 500);
                    }
                    
                    resolve(true);
                } else {
                    this.logWarning('API returned invalid stroke data');
                    resolve(false);
                }
                
            } catch (error) {
                this.logError('API request error:', error);
                resolve(false);
            }
        });
    }
    
    createCustomSVG(strokeData) {
        this.container.innerHTML = '';
        
        // 创建 SVG 容器
        this.fallbackSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.fallbackSVG.setAttribute('width', this.options.width);
        this.fallbackSVG.setAttribute('height', this.options.height);
        this.fallbackSVG.setAttribute('viewBox', '0 0 1024 1024');
        this.fallbackSVG.style.border = '2px solid #ddd';
        this.fallbackSVG.style.borderRadius = '10px';
        this.fallbackSVG.style.background = 'white';
        
        // 添加网格
        if (this.options.showGrid) {
            this.addGrid();
        }
        
        // 处理笔画数据
        this.strokes = strokeData.strokes.map(stroke => this.parseSVGPath(stroke));
        
        // 渲染静态笔画（半透明）
        this.renderStaticStrokes();
        
        // 显示背景字符
        if (this.options.showCharacter) {
            this.showBackgroundCharacter();
        }
        
        this.container.appendChild(this.fallbackSVG);
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
        this.fallbackSVG.appendChild(gridGroup);
    }
    
    parseSVGPath(pathString) {
        // 简化的 SVG 路径解析
        const commands = pathString.match(/[ML][^ML]*/g) || [];
        const points = [];
        
        commands.forEach(cmd => {
            const type = cmd[0];
            const coords = cmd.slice(1).trim().split(/\s+/).map(Number);
            
            if (type === 'M' || type === 'L') {
                points.push({ type, x: coords[0], y: coords[1] });
            }
        });
        
        return points;
    }
    
    renderStaticStrokes() {
        this.strokes.forEach((stroke, index) => {
            const path = this.createStrokePath(stroke, index);
            path.style.opacity = this.options.showOutline ? '0.3' : '0';
            path.setAttribute('class', 'static-stroke');
            this.fallbackSVG.appendChild(path);
        });
    }
    
    createStrokePath(strokePoints, index) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        let pathData = '';
        strokePoints.forEach(point => {
            pathData += `${point.type} ${point.x} ${point.y} `;
        });
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', this.options.strokeColor);
        path.setAttribute('stroke-width', this.options.strokeWidth);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('fill', 'none');
        path.setAttribute('data-stroke', index);
        
        return path;
    }
    
    showBackgroundCharacter() {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '512');
        text.setAttribute('y', '600');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '200');
        text.setAttribute('font-family', 'serif');
        text.setAttribute('fill', '#f0f0f0');
        text.setAttribute('class', 'background-character');
        text.textContent = this.character;
        
        this.fallbackSVG.appendChild(text);
    }
    
    addControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'stroke-controls';
        controlsDiv.style.cssText = `
            margin-top: 10px;
            text-align: center;
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        `;
        
        const animateBtn = this.createButton('播放动画', () => this.animate());
        const clearBtn = this.createButton('清除', () => this.clear());
        const resetBtn = this.createButton('重置', () => this.reset());
        
        controlsDiv.appendChild(animateBtn);
        controlsDiv.appendChild(clearBtn);
        controlsDiv.appendChild(resetBtn);
        
        this.container.appendChild(controlsDiv);
    }
    
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'btn btn-sm btn-outline-primary';
        button.style.cssText = `
            padding: 5px 15px;
            border-radius: 15px;
            border: 2px solid #4CAF50;
            background: white;
            color: #4CAF50;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('click', onClick);
        button.addEventListener('mouseenter', () => {
            button.style.background = '#4CAF50';
            button.style.color = 'white';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'white';
            button.style.color = '#4CAF50';
        });
        
        return button;
    }
    
    async animate() {
        if (!this.isLoaded || this.isAnimating) return;
        
        if (this.currentWriter) {
            // 使用 HanziWriter 动画
            try {
                this.isAnimating = true;
                await this.currentWriter.animateCharacter();
                this.isAnimating = false;
            } catch (error) {
                this.logError('HanziWriter animation error:', error);
                this.isAnimating = false;
            }
        } else if (this.fallbackSVG && this.strokes) {
            // 使用自定义 SVG 动画
            await this.animateCustomStrokes();
        }
    }
    
    async animateCustomStrokes() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // 清除之前的动画笔画
        const animatedStrokes = this.fallbackSVG.querySelectorAll('.animated-stroke');
        animatedStrokes.forEach(stroke => stroke.remove());
        
        for (let i = 0; i < this.strokes.length; i++) {
            await this.animateStroke(i);
            await this.delay(this.options.delayBetweenStrokes);
        }
        
        this.isAnimating = false;
    }
    
    async animateStroke(strokeIndex) {
        const stroke = this.strokes[strokeIndex];
        const path = this.createStrokePath(stroke, strokeIndex);
        
        path.setAttribute('class', 'animated-stroke');
        path.style.opacity = '1';
        path.style.strokeDasharray = '2000';
        path.style.strokeDashoffset = '2000';
        
        // 添加 CSS 动画
        const animationName = `drawStroke-${Date.now()}`;
        this.addStrokeAnimation(animationName, this.options.animationSpeed);
        
        path.style.animation = `${animationName} ${this.options.animationSpeed / 1000}s ease-in-out forwards`;
        
        this.fallbackSVG.appendChild(path);
        
        return this.delay(this.options.animationSpeed);
    }
    
    addStrokeAnimation(name, duration) {
        const styleId = `stroke-animation-${name}`;
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes ${name} {
                to { stroke-dashoffset: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // 清理样式
        setTimeout(() => {
            const elem = document.getElementById(styleId);
            if (elem) elem.remove();
        }, duration + 1000);
    }
    
    clear() {
        if (this.currentWriter) {
            this.currentWriter.clear();
        } else if (this.fallbackSVG) {
            const animatedStrokes = this.fallbackSVG.querySelectorAll('.animated-stroke');
            animatedStrokes.forEach(stroke => stroke.remove());
        }
    }
    
    reset() {
        this.clear();
        this.isAnimating = false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showLoading() {
        this.container.innerHTML = `
            <div style="
                width: ${this.options.width}px; 
                height: ${this.options.height}px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                border: 2px solid #ddd;
                border-radius: 10px;
                background: white;
                color: #666;
            ">
                <div style="text-align: center;">
                    <div style="margin-bottom: 10px;">🔄</div>
                    <div>加载笔顺数据...</div>
                </div>
            </div>
        `;
    }
    
    showStaticFallback() {
        this.container.innerHTML = `
            <div style="
                width: ${this.options.width}px; 
                height: ${this.options.height}px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                border: 2px solid #ddd;
                border-radius: 10px;
                background: white;
                flex-direction: column;
            ">
                <div style="font-size: 120px; color: ${this.options.strokeColor};">${this.character}</div>
                <div style="color: #666; font-size: 14px;">静态显示</div>
            </div>
        `;
        this.isLoaded = true;
    }
    
    showErrorFallback() {
        this.container.innerHTML = `
            <div style="
                width: ${this.options.width}px; 
                height: ${this.options.height}px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                border: 2px solid #f44336;
                border-radius: 10px;
                background: #ffebee;
                flex-direction: column;
                color: #c62828;
            ">
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div style="font-size: 14px;">加载失败</div>
                <div style="font-size: 32px; margin-top: 10px;">${this.character}</div>
            </div>
        `;
    }
    
    // 日志方法
    logSuccess(message) {
        console.log(`[StrokeAnimator] ✅ ${message}`);
    }
    
    logWarning(message, detail = '') {
        console.warn(`[StrokeAnimator] ⚠️ ${message}`, detail);
    }
    
    logError(message, error = '') {
        console.error(`[StrokeAnimator] ❌ ${message}`, error);
    }
    
    // 公共 API
    destroy() {
        if (this.currentWriter) {
            // HanziWriter 没有官方的 destroy 方法，只能清空容器
            this.currentWriter = null;
        }
        this.container.innerHTML = '';
        this.isLoaded = false;
        this.isAnimating = false;
    }
    
    getCharacter() {
        return this.character;
    }
    
    isReady() {
        return this.isLoaded;
    }
    
    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// 导出到全局
window.EnhancedStrokeAnimator = EnhancedStrokeAnimator;

// 兼容性包装器
window.createStrokeAnimator = function(containerId, character, options) {
    return new EnhancedStrokeAnimator(containerId, character, options);
};