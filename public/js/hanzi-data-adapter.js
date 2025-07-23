/**
 * HanziWriter数据适配器 - 解决笔顺数据格式兼容性问题
 * 提供统一的数据转换和错误处理机制
 */

class HanziDataAdapter {
    constructor() {
        this.cache = new Map();
        this.debugMode = false;
        this.version = '1.0.0';
    }

    /**
     * 启用调试模式
     */
    enableDebug() {
        this.debugMode = true;
        console.log('🔧 HanziDataAdapter调试模式已启用');
    }

    /**
     * 日志输出
     */
    log(message, data = null) {
        if (this.debugMode) {
            console.log(`📝 [HanziAdapter] ${message}`, data || '');
        }
    }

    /**
     * 错误日志
     */
    error(message, error = null) {
        console.error(`❌ [HanziAdapter] ${message}`, error || '');
    }

    /**
     * 转换简化的笔顺数据为HanziWriter兼容格式
     * @param {Object} rawData - 来自API的原始数据
     * @returns {Object} HanziWriter兼容的数据格式
     */
    convertToHanziWriterFormat(rawData) {
        this.log('开始转换数据格式', rawData);

        if (!rawData || !rawData.stroke_order_json) {
            this.error('无效的笔顺数据');
            return null;
        }

        const strokeData = rawData.stroke_order_json;
        
        try {
            // 检查数据结构
            if (!strokeData.strokes || !Array.isArray(strokeData.strokes)) {
                this.error('笔顺数据缺少strokes数组');
                return null;
            }

            // 转换为HanziWriter期望的格式
            const convertedData = {
                strokes: this.convertStrokes(strokeData.strokes),
                medians: this.convertMedians(strokeData.medians || []),
                metadata: {
                    character: rawData.simp_char || rawData.trad_char,
                    radical: rawData.radical,
                    strokeCount: strokeData.strokes.length,
                    adapterVersion: this.version
                }
            };

            this.log('数据转换完成', convertedData);
            return convertedData;

        } catch (error) {
            this.error('数据转换失败', error);
            return null;
        }
    }

    /**
     * 转换笔画路径数据
     * @param {Array} strokes - SVG路径字符串数组
     * @returns {Array} 转换后的笔画数据
     */
    convertStrokes(strokes) {
        return strokes.map((stroke, index) => {
            try {
                // HanziWriter 4.x 期望的格式
                if (typeof stroke === 'string') {
                    // 解析SVG路径为点坐标
                    const pathData = this.parseSVGPath(stroke);
                    return this.createStrokeObject(pathData, index);
                } else if (stroke && typeof stroke === 'object') {
                    // 如果已经是对象格式，直接返回
                    return stroke;
                }
                
                throw new Error(`无效的笔画数据类型: ${typeof stroke}`);
            } catch (error) {
                this.error(`转换第${index + 1}笔失败`, error);
                return this.createFallbackStroke(index);
            }
        });
    }

    /**
     * 解析SVG路径
     * @param {string} pathString - SVG路径字符串
     * @returns {Array} 路径点数组
     */
    parseSVGPath(pathString) {
        const commands = pathString.match(/[ML][^ML]*/g) || [];
        const points = [];
        
        commands.forEach(cmd => {
            const type = cmd[0];
            const coords = cmd.slice(1).trim().split(/\s+/).map(Number);
            
            if ((type === 'M' || type === 'L') && coords.length >= 2) {
                points.push({
                    type: type,
                    x: coords[0],
                    y: coords[1]
                });
            }
        });
        
        return points;
    }

    /**
     * 创建笔画对象
     * @param {Array} pathData - 路径点数据
     * @param {number} index - 笔画索引
     * @returns {Object} HanziWriter笔画对象
     */
    createStrokeObject(pathData, index) {
        if (pathData.length < 2) {
            throw new Error('笔画数据点数不足');
        }

        // 构建HanziWriter兼容的笔画对象
        return {
            id: index,
            path: this.pathDataToSVGPath(pathData),
            points: pathData,
            length: this.calculateStrokeLength(pathData),
            metadata: {
                originalFormat: 'custom-svg',
                pointCount: pathData.length
            }
        };
    }

    /**
     * 路径数据转换为SVG路径字符串
     * @param {Array} pathData - 路径点数据
     * @returns {string} SVG路径字符串
     */
    pathDataToSVGPath(pathData) {
        return pathData.map((point, index) => {
            const command = index === 0 ? 'M' : 'L';
            return `${command} ${point.x} ${point.y}`;
        }).join(' ');
    }

    /**
     * 计算笔画长度
     * @param {Array} pathData - 路径点数据
     * @returns {number} 笔画长度
     */
    calculateStrokeLength(pathData) {
        let length = 0;
        for (let i = 1; i < pathData.length; i++) {
            const prev = pathData[i - 1];
            const curr = pathData[i];
            length += Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + 
                Math.pow(curr.y - prev.y, 2)
            );
        }
        return length;
    }

    /**
     * 创建备用笔画
     * @param {number} index - 笔画索引
     * @returns {Object} 备用笔画对象
     */
    createFallbackStroke(index) {
        return {
            id: index,
            path: `M 100 100 L 200 200`, // 简单的对角线
            points: [
                { type: 'M', x: 100, y: 100 },
                { type: 'L', x: 200, y: 200 }
            ],
            length: Math.sqrt(2) * 100,
            metadata: {
                isFallback: true,
                reason: 'stroke_conversion_failed'
            }
        };
    }

    /**
     * 转换medians数据
     * @param {Array} medians - 原始medians数据
     * @returns {Array} 转换后的medians数据
     */
    convertMedians(medians) {
        if (!Array.isArray(medians)) {
            this.log('无medians数据，使用空数组');
            return [];
        }

        return medians.map((median, index) => {
            try {
                if (Array.isArray(median) && median.length >= 2) {
                    return median.map(point => {
                        if (Array.isArray(point) && point.length >= 2) {
                            return [Number(point[0]), Number(point[1])];
                        }
                        return [0, 0];
                    });
                }
                return [[0, 0], [100, 100]]; // 默认median
            } catch (error) {
                this.error(`转换median ${index}失败`, error);
                return [[0, 0], [100, 100]];
            }
        });
    }

    /**
     * 验证转换后的数据
     * @param {Object} data - 转换后的数据
     * @returns {boolean} 验证结果
     */
    validateConvertedData(data) {
        if (!data) {
            this.error('数据为空');
            return false;
        }

        if (!data.strokes || !Array.isArray(data.strokes)) {
            this.error('缺少strokes数组');
            return false;
        }

        if (data.strokes.length === 0) {
            this.error('strokes数组为空');
            return false;
        }

        // 验证每个笔画
        for (let i = 0; i < data.strokes.length; i++) {
            const stroke = data.strokes[i];
            if (!stroke.path || !stroke.points) {
                this.error(`第${i + 1}笔缺少必要数据`);
                return false;
            }
        }

        this.log('数据验证通过');
        return true;
    }

    /**
     * 创建HanziWriter实例的高级配置
     * @param {string} character - 汉字字符
     * @param {Object} rawData - 原始数据
     * @param {Object} options - 附加选项
     * @returns {Object} HanziWriter配置对象
     */
    createHanziWriterConfig(character, rawData, options = {}) {
        const convertedData = this.convertToHanziWriterFormat(rawData);
        
        if (!convertedData || !this.validateConvertedData(convertedData)) {
            this.error('无法创建HanziWriter配置，数据无效');
            return this.createFallbackConfig(character, options);
        }

        // 缓存转换后的数据
        this.cache.set(character, convertedData);

        const config = {
            width: options.width || 300,
            height: options.height || 300,
            padding: options.padding || 20,
            strokeColor: options.strokeColor || '#4CAF50',
            strokeAnimationSpeed: options.strokeAnimationSpeed || 1,
            delayBetweenStrokes: options.delayBetweenStrokes || 300,
            showOutline: options.showOutline !== false,
            showCharacter: options.showCharacter !== false,
            
            // 自定义数据加载器
            charDataLoader: () => {
                this.log(`为字符 ${character} 提供自定义数据`);
                return Promise.resolve(convertedData);
            },

            // 错误处理
            onLoadCharDataError: (error) => {
                this.error('HanziWriter数据加载失败', error);
                if (options.onError) {
                    options.onError(error);
                }
            },

            // 成功回调
            onLoadCharDataSuccess: () => {
                this.log(`字符 ${character} 数据加载成功`);
                if (options.onSuccess) {
                    options.onSuccess(convertedData);
                }
            }
        };

        this.log('HanziWriter配置已创建', config);
        return config;
    }

    /**
     * 创建备用配置（当数据转换失败时）
     * @param {string} character - 汉字字符
     * @param {Object} options - 附加选项
     * @returns {Object} 备用配置
     */
    createFallbackConfig(character, options = {}) {
        this.log(`为字符 ${character} 创建备用配置`);
        
        return {
            width: options.width || 300,
            height: options.height || 300,
            padding: options.padding || 20,
            strokeColor: options.strokeColor || '#FF9800',
            strokeAnimationSpeed: options.strokeAnimationSpeed || 1,
            delayBetweenStrokes: options.delayBetweenStrokes || 500,
            showOutline: options.showOutline !== false,
            showCharacter: options.showCharacter !== false,
            
            // 使用HanziWriter的默认数据源
            // 不提供charDataLoader，让HanziWriter自己加载数据
            
            onLoadCharDataError: (error) => {
                this.error('备用配置数据加载也失败', error);
                if (options.onError) {
                    options.onError(error);
                }
            }
        };
    }

    /**
     * 获取缓存的数据
     * @param {string} character - 汉字字符
     * @returns {Object|null} 缓存的数据
     */
    getCachedData(character) {
        return this.cache.get(character) || null;
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        this.log('缓存已清除');
    }

    /**
     * 获取适配器状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            version: this.version,
            cacheSize: this.cache.size,
            debugMode: this.debugMode,
            supportedFormats: ['custom-svg', 'hanzi-writer-standard'],
            lastUpdate: new Date().toISOString()
        };
    }
}

// 创建全局实例
window.HanziDataAdapter = new HanziDataAdapter();

// 开发模式下启用调试
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.HanziDataAdapter.enableDebug();
}

console.log('✅ HanziDataAdapter已加载', window.HanziDataAdapter.getStatus());