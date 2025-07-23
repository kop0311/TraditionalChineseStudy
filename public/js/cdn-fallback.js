/**
 * CDN 故障检测与自动降级系统
 * 确保中文字体和汉字库的持续可用性
 */

class CDNFallbackManager {
    constructor() {
        this.fallbacks = {
            'bootstrap': [
                'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                'https://unpkg.com/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css'
            ],
            'hanzi-writer': [
                'https://cdn.jsdelivr.net/npm/hanzi-writer@4.3.0/dist/hanzi-writer.min.js',
                'https://unpkg.com/hanzi-writer@4.3.0/dist/hanzi-writer.min.js'
            ],
            'noto-fonts': [
                'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap',
                'https://fonts.gstatic.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap'
            ]
        };
        
        this.loadingStatus = {};
        this.retryCount = {};
        this.maxRetries = 3;
        
        this.initFontMonitoring();
    }

    /**
     * 检测资源加载状态
     */
    async checkResourceAvailability(url, timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            if (url.endsWith('.css')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                
                link.onload = () => {
                    const loadTime = Date.now() - startTime;
                    resolve({ success: true, loadTime, url });
                };
                
                link.onerror = () => {
                    resolve({ success: false, error: 'Failed to load CSS', url });
                };
                
                document.head.appendChild(link);
                
                // 超时处理
                setTimeout(() => {
                    if (!link.sheet) {
                        resolve({ success: false, error: 'Timeout', url });
                    }
                }, timeout);
                
            } else if (url.endsWith('.js')) {
                const script = document.createElement('script');
                script.src = url;
                
                script.onload = () => {
                    const loadTime = Date.now() - startTime;
                    resolve({ success: true, loadTime, url });
                };
                
                script.onerror = () => {
                    resolve({ success: false, error: 'Failed to load JS', url });
                };
                
                document.head.appendChild(script);
                
                // 超时处理
                setTimeout(() => {
                    resolve({ success: false, error: 'Timeout', url });
                }, timeout);
            }
        });
    }

    /**
     * 字体加载监控
     */
    initFontMonitoring() {
        if ('fonts' in document) {
            // 监控中文字体加载
            const chineseFonts = ['Noto Sans SC', 'Noto Sans TC'];
            
            chineseFonts.forEach(fontFamily => {
                document.fonts.load(`16px "${fontFamily}"`).then(() => {
                    console.log(`✅ 字体加载成功: ${fontFamily}`);
                    this.updateFontStatus(fontFamily, true);
                }).catch((error) => {
                    console.warn(`⚠️ 字体加载失败: ${fontFamily}`, error);
                    this.updateFontStatus(fontFamily, false);
                    this.activateFontFallback();
                });
            });

            // 监听字体加载事件
            document.fonts.addEventListener('loadingdone', (event) => {
                console.log('字体加载完成:', event);
            });

            document.fonts.addEventListener('loadingerror', (event) => {
                console.error('字体加载错误:', event);
                this.activateFontFallback();
            });
        }
    }

    /**
     * 更新字体状态
     */
    updateFontStatus(fontFamily, loaded) {
        this.loadingStatus[fontFamily] = loaded;
        
        // 显示状态指示器
        this.showFontStatus(fontFamily, loaded);
    }

    /**
     * 显示字体状态
     */
    showFontStatus(fontFamily, loaded) {
        const statusId = `font-status-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
        let statusElement = document.getElementById(statusId);
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = statusId;
            statusElement.style.cssText = `
                position: fixed;
                top: ${Object.keys(this.loadingStatus).length * 30 + 10}px;
                right: 10px;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(statusElement);
        }
        
        if (loaded) {
            statusElement.textContent = `✅ ${fontFamily}`;
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            
            // 3秒后隐藏成功状态
            setTimeout(() => {
                statusElement.style.opacity = '0';
                setTimeout(() => statusElement.remove(), 300);
            }, 3000);
        } else {
            statusElement.textContent = `❌ ${fontFamily}`;
            statusElement.style.backgroundColor = '#f8d7da';
            statusElement.style.color = '#721c24';
        }
    }

    /**
     * 激活字体降级方案
     */
    activateFontFallback() {
        console.log('激活字体降级方案...');
        
        // 添加强制使用系统字体的CSS
        const fallbackCSS = `
            * {
                font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 
                           'SimSun', '宋体', 'Arial Unicode MS', sans-serif !important;
            }
            .text-chinese {
                font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 
                           'SimSun', '宋体', 'Arial Unicode MS', sans-serif !important;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = fallbackCSS;
        document.head.appendChild(style);
        
        // 显示降级通知
        this.showFallbackNotification();
    }

    /**
     * 显示降级通知
     */
    showFallbackNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div style="color: #856404; font-weight: 600; margin-bottom: 8px;">
                🔄 字体加载优化
            </div>
            <div style="color: #856404; font-size: 14px;">
                正在使用系统字体确保中文显示正常
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * 加载资源并处理降级
     */
    async loadWithFallback(resourceType, primaryUrl) {
        const fallbackUrls = this.fallbacks[resourceType] || [];
        const allUrls = [primaryUrl, ...fallbackUrls].filter(Boolean);
        
        for (let i = 0; i < allUrls.length; i++) {
            const url = allUrls[i];
            console.log(`尝试加载 ${resourceType}: ${url}`);
            
            try {
                const result = await this.checkResourceAvailability(url);
                if (result.success) {
                    console.log(`✅ ${resourceType} 加载成功: ${url} (${result.loadTime}ms)`);
                    return result;
                }
            } catch (error) {
                console.warn(`❌ ${resourceType} 加载失败: ${url}`, error);
            }
        }
        
        console.error(`❌ 所有 ${resourceType} CDN 都无法访问，请检查网络连接`);
        return null;
    }

    /**
     * 检查和修复汉字书写器
     */
    async ensureHanziWriter() {
        if (typeof window.HanziWriter !== 'undefined') {
            console.log('✅ HanziWriter 已加载');
            return true;
        }

        console.log('🔄 HanziWriter 未检测到，开始加载...');
        
        const result = await this.loadWithFallback('hanzi-writer', 
            document.querySelector('script[src*="hanzi-writer"]')?.src);
        
        if (result) {
            // 等待脚本执行
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (typeof window.HanziWriter !== 'undefined') {
                console.log('✅ HanziWriter 降级加载成功');
                return true;
            }
        }
        
        console.error('❌ HanziWriter 加载失败，汉字书写功能不可用');
        return false;
    }

    /**
     * 全面健康检查
     */
    async performHealthCheck() {
        console.log('🔍 开始CDN健康检查...');
        
        const checks = [
            this.ensureHanziWriter(),
            // 可以添加更多检查项
        ];
        
        const results = await Promise.all(checks);
        const allHealthy = results.every(result => result === true);
        
        if (allHealthy) {
            console.log('✅ 所有CDN资源正常');
        } else {
            console.warn('⚠️ 部分CDN资源异常，已启用降级方案');
        }
        
        return allHealthy;
    }
}

// 初始化CDN降级管理器
const cdnManager = new CDNFallbackManager();

// 页面加载完成后执行健康检查
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => cdnManager.performHealthCheck(), 2000);
    });
} else {
    setTimeout(() => cdnManager.performHealthCheck(), 2000);
}

// 暴露全局接口
window.CDNFallbackManager = cdnManager;