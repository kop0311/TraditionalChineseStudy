/**
 * HanziWriter版本管理器
 * 确保所有页面使用统一的HanziWriter版本和API
 */

class HanziWriterVersionManager {
    constructor() {
        this.targetVersion = '4.3.0';
        this.cdnSources = [
            `https://cdn.jsdelivr.net/npm/hanzi-writer@${this.targetVersion}/dist/hanzi-writer.min.js`,
            `https://unpkg.com/hanzi-writer@${this.targetVersion}/dist/hanzi-writer.min.js`
        ];
        this.loadingPromise = null;
        this.debugMode = false;
    }

    /**
     * 启用调试模式
     */
    enableDebug() {
        this.debugMode = true;
        console.log('🔧 HanziWriter版本管理器调试模式已启用');
    }

    /**
     * 日志输出
     */
    log(message, data = null) {
        if (this.debugMode) {
            console.log(`📝 [HanziVersionMgr] ${message}`, data || '');
        }
    }

    /**
     * 错误日志
     */
    error(message, error = null) {
        console.error(`❌ [HanziVersionMgr] ${error}`, error || '');
    }

    /**
     * 检查当前加载的HanziWriter版本
     * @returns {string|null} 当前版本或null
     */
    getCurrentVersion() {
        if (typeof window.HanziWriter !== 'undefined') {
            // 尝试获取版本信息
            try {
                // HanziWriter 4.x 有版本属性
                if (window.HanziWriter.VERSION) {
                    return window.HanziWriter.VERSION;
                }
                
                // 检查API特征来推断版本
                if (window.HanziWriter.create && window.HanziWriter.loadCharacterData) {
                    return '4.x.x (推断)';
                } else if (window.HanziWriter.create) {
                    return '3.x.x (推断)';
                }
                
                return '未知版本';
            } catch (error) {
                this.error('获取版本信息失败', error);
                return '错误状态';
            }
        }
        return null;
    }

    /**
     * 检查版本兼容性
     * @param {string} version - 版本字符串
     * @returns {boolean} 是否兼容
     */
    isVersionCompatible(version) {
        if (!version) return false;
        
        // 4.x.x 版本都兼容
        return version.startsWith('4.') || version.includes('4.x.x');
    }

    /**
     * 确保HanziWriter已加载且版本正确
     * @returns {Promise<boolean>} 加载是否成功
     */
    async ensureLoaded() {
        // 如果已经在加载中，等待之前的加载完成
        if (this.loadingPromise) {
            return await this.loadingPromise;
        }

        // 检查当前状态
        const currentVersion = this.getCurrentVersion();
        
        if (currentVersion && this.isVersionCompatible(currentVersion)) {
            this.log(`HanziWriter ${currentVersion} 已加载且兼容`);
            return true;
        }

        if (currentVersion && !this.isVersionCompatible(currentVersion)) {
            this.log(`检测到不兼容版本: ${currentVersion}，需要重新加载`);
            // 清除旧版本（如果可能）
            this.clearOldVersion();
        }

        // 开始加载
        this.loadingPromise = this.loadTargetVersion();
        const result = await this.loadingPromise;
        this.loadingPromise = null;
        
        return result;
    }

    /**
     * 加载目标版本的HanziWriter
     * @returns {Promise<boolean>} 加载是否成功
     */
    async loadTargetVersion() {
        this.log(`开始加载HanziWriter ${this.targetVersion}`);

        for (let i = 0; i < this.cdnSources.length; i++) {
            const cdnUrl = this.cdnSources[i];
            
            try {
                this.log(`尝试从CDN加载: ${cdnUrl}`);
                const success = await this.loadScript(cdnUrl);
                
                if (success) {
                    const loadedVersion = this.getCurrentVersion();
                    this.log(`HanziWriter ${loadedVersion} 加载成功`);
                    
                    // 验证API可用性
                    if (this.validateAPI()) {
                        return true;
                    } else {
                        this.error('API验证失败');
                        continue;
                    }
                }
            } catch (error) {
                this.error(`从 ${cdnUrl} 加载失败`, error);
                continue;
            }
        }

        this.error('所有CDN源都加载失败');
        return false;
    }

    /**
     * 动态加载脚本
     * @param {string} url - 脚本URL
     * @returns {Promise<boolean>} 加载是否成功
     */
    loadScript(url) {
        return new Promise((resolve) => {
            // 检查是否已存在相同的脚本
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            script.onload = () => {
                this.log(`脚本加载成功: ${url}`);
                resolve(true);
            };
            
            script.onerror = () => {
                this.error(`脚本加载失败: ${url}`);
                script.remove();
                resolve(false);
            };
            
            // 超时处理
            setTimeout(() => {
                if (!script.hasAttribute('data-loaded')) {
                    this.error(`脚本加载超时: ${url}`);
                    script.remove();
                    resolve(false);
                }
            }, 10000);
            
            document.head.appendChild(script);
        });
    }

    /**
     * 验证HanziWriter API
     * @returns {boolean} API是否可用
     */
    validateAPI() {
        try {
            if (typeof window.HanziWriter !== 'object') {
                this.error('HanziWriter不是对象');
                return false;
            }

            if (typeof window.HanziWriter.create !== 'function') {
                this.error('HanziWriter.create不是函数');
                return false;
            }

            // 测试基本API
            const testDiv = document.createElement('div');
            testDiv.style.display = 'none';
            document.body.appendChild(testDiv);
            
            try {
                const testWriter = window.HanziWriter.create(testDiv, '测', {
                    width: 100,
                    height: 100,
                    showOutline: false,
                    showCharacter: false
                });
                
                if (testWriter && typeof testWriter.animateCharacter === 'function') {
                    this.log('API验证通过');
                    testDiv.remove();
                    return true;
                }
            } catch (apiError) {
                this.error('API测试失败', apiError);
            } finally {
                testDiv.remove();
            }
            
            return false;
        } catch (error) {
            this.error('API验证异常', error);
            return false;
        }
    }

    /**
     * 清除旧版本HanziWriter
     */
    clearOldVersion() {
        try {
            // 移除旧版本的script标签
            const oldScripts = document.querySelectorAll('script[src*="hanzi-writer"]');
            oldScripts.forEach(script => {
                this.log(`移除旧版本脚本: ${script.src}`);
                script.remove();
            });

            // 清除全局变量（小心操作）
            if (window.HanziWriter) {
                this.log('清除旧版本全局变量');
                delete window.HanziWriter;
            }
        } catch (error) {
            this.error('清除旧版本失败', error);
        }
    }

    /**
     * 创建HanziWriter实例（带版本检查）
     * @param {Element} element - 目标元素
     * @param {string} character - 字符
     * @param {Object} options - 选项
     * @returns {Promise<Object|null>} HanziWriter实例
     */
    async createWriter(element, character, options = {}) {
        const loaded = await this.ensureLoaded();
        
        if (!loaded) {
            this.error('HanziWriter加载失败，无法创建实例');
            return null;
        }

        try {
            this.log(`创建HanziWriter实例: ${character}`);
            const writer = window.HanziWriter.create(element, character, options);
            
            if (writer) {
                this.log('HanziWriter实例创建成功');
                return writer;
            } else {
                this.error('HanziWriter实例创建失败');
                return null;
            }
        } catch (error) {
            this.error('创建HanziWriter实例异常', error);
            return null;
        }
    }

    /**
     * 获取管理器状态
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            targetVersion: this.targetVersion,
            currentVersion: this.getCurrentVersion(),
            isCompatible: this.isVersionCompatible(this.getCurrentVersion()),
            isLoaded: typeof window.HanziWriter !== 'undefined',
            apiValid: this.validateAPI(),
            cdnSources: this.cdnSources,
            debugMode: this.debugMode
        };
    }

    /**
     * 显示状态报告
     */
    showStatusReport() {
        const status = this.getStatus();
        console.table(status);
        return status;
    }
}

// 创建全局实例
window.HanziWriterVersionManager = new HanziWriterVersionManager();

// 开发模式下启用调试
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.HanziWriterVersionManager.enableDebug();
}

console.log('✅ HanziWriter版本管理器已加载');