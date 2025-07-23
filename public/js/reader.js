// Reader Page JavaScript

class CharacterModal {
    constructor() {
        this.modal = new bootstrap.Modal(document.getElementById('charModal'));
        this.currentWriter = null;
        this.currentChar = '';
        this.init();
    }

    init() {
        // Add click handlers to all clickable characters
        const clickableChars = document.querySelectorAll('.clickable-char');
        
        clickableChars.forEach(char => {
            char.addEventListener('click', (e) => {
                const character = e.target.dataset.char;
                const type = e.target.dataset.type;
                this.showCharacter(character, type);
            });
        });

        // Modal event handlers
        document.getElementById('animate-btn').addEventListener('click', () => {
            this.animateCharacter();
        });

        document.getElementById('animate-slow-btn').addEventListener('click', () => {
            this.animateCharacter(true);
        });

        // Story tab handler
        document.getElementById('story-tab').addEventListener('click', () => {
            this.loadCharacterStory();
        });

        // Etymology tab handler
        document.getElementById('etymology-tab').addEventListener('click', () => {
            this.loadCharacterEtymology();
        });
        
        // Modal event handlers for accessibility
        const modalElement = document.getElementById('charModal');
        
        modalElement.addEventListener('show.bs.modal', () => {
            // Remove aria-hidden when modal is about to show
            modalElement.removeAttribute('aria-hidden');
        });
        
        modalElement.addEventListener('hidden.bs.modal', () => {
            // Add aria-hidden when modal is hidden
            modalElement.setAttribute('aria-hidden', 'true');
        });
    }

    async showCharacter(character, type = 'simp') {
        this.currentChar = character;
        
        // Update modal title
        document.getElementById('charModalTitle').textContent = 
            `${character} - 汉字详情`;

        // Reset tabs
        this.resetTabs();
        
        // Show modal
        this.modal.show();

        // Load character data
        try {
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ character: character })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderCharacter(data);
            } else {
                this.showCharacterNotFound();
            }
        } catch (error) {
            console.error('Error loading character:', error);
            this.showCharacterNotFound();
        }
    }

    renderCharacter(data) {
        // Create hanzi writer
        const writerDiv = document.getElementById('hanzi-writer');
        writerDiv.innerHTML = '';

        if (window.HanziWriter) {
            try {
                // Use custom stroke data if available
                let writerOptions = {
                    width: 300,
                    height: 300,
                    padding: 20,
                    strokeColor: '#4CAF50',
                    radicalColor: '#FF9800',
                    strokeAnimationSpeed: 0.8,
                    delayBetweenStrokes: 300,
                    showOutline: true,
                    showCharacter: false
                };

                // If we have local stroke data, use it
                if (data.stroke_order_json && data.stroke_order_json.strokes) {
                    writerOptions.charDataLoader = () => {
                        return Promise.resolve({
                            strokes: data.stroke_order_json.strokes,
                            medians: data.stroke_order_json.medians || []
                        });
                    };
                }

                this.currentWriter = HanziWriter.create(writerDiv, data.simp_char, writerOptions);

                // Enable animation buttons
                document.getElementById('animate-btn').disabled = false;
                document.getElementById('animate-slow-btn').disabled = false;
                
                // Auto-play animation once
                setTimeout(() => this.animateCharacter(), 500);
                
            } catch (error) {
                console.error('Error creating hanzi writer:', error);
                this.showStrokeOrderNotAvailable();
            }
        } else {
            this.showStrokeOrderNotAvailable();
        }

        // Store story data for later loading
        this.currentStoryHtml = data.story_html;
        this.currentEtymologyData = data.etymology_data;
    }

    animateCharacter(slow = false) {
        if (this.currentWriter) {
            this.currentWriter.animateCharacter({
                strokeAnimationSpeed: slow ? 0.5 : 1,
                delayBetweenStrokes: slow ? 500 : 100
            });
        }
    }

    loadCharacterStory() {
        const storyContainer = document.getElementById('char-story');
        
        if (this.currentStoryHtml) {
            storyContainer.innerHTML = this.currentStoryHtml;
        } else {
            storyContainer.innerHTML = '<p class="text-muted">暂无故事内容。</p>';
        }
    }

    async loadCharacterEtymology() {
        const etymologyContainer = document.getElementById('char-etymology');
        
        // Show loading state
        etymologyContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">加载中...</span></div><p class="mt-2 text-muted">正在获取字源数据...</p></div>';
        
        try {
            // Check if we have cached etymology data
            if (this.currentEtymologyData && this.currentEtymologyData.character) {
                this.renderEtymologyData(this.currentEtymologyData);
                return;
            }

            // Fetch etymology data from API
            const response = await fetch('/api/characters/etymology', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ character: this.currentChar })
            });

            if (response.ok) {
                const etymologyData = await response.json();
                this.renderEtymologyData(etymologyData);
                this.currentEtymologyData = etymologyData;
            } else {
                etymologyContainer.innerHTML = '<p class="text-muted">字源数据获取失败。</p>';
            }
        } catch (error) {
            console.error('Error loading etymology:', error);
            etymologyContainer.innerHTML = '<p class="text-muted">字源数据加载出错。</p>';
        }
    }

    renderEtymologyData(data) {
        const etymologyContainer = document.getElementById('char-etymology');
        
        const html = `
            <div class="etymology-timeline">
                <h6 class="mb-3">"${data.character}" 字的演变历程</h6>
                
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-header bg-primary text-white">
                                <h6 class="mb-0">甲骨文</h6>
                                <small>${data.evolution.oracle_bone.period}</small>
                            </div>
                            <div class="card-body text-center">
                                ${data.evolution.oracle_bone.image_url ? 
                                    `<img src="${data.evolution.oracle_bone.image_url}" alt="甲骨文" class="etymology-image mb-2" style="max-width: 80px; max-height: 80px;">` : 
                                    '<div class="text-muted mb-2">暂无图片</div>'
                                }
                                <p class="small">${data.evolution.oracle_bone.description || '暂无描述'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-header bg-warning text-dark">
                                <h6 class="mb-0">金文</h6>
                                <small>${data.evolution.bronze.period}</small>
                            </div>
                            <div class="card-body text-center">
                                ${data.evolution.bronze.image_url ? 
                                    `<img src="${data.evolution.bronze.image_url}" alt="金文" class="etymology-image mb-2" style="max-width: 80px; max-height: 80px;">` : 
                                    '<div class="text-muted mb-2">暂无图片</div>'
                                }
                                <p class="small">${data.evolution.bronze.description || '暂无描述'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0">小篆</h6>
                                <small>${data.evolution.seal.period}</small>
                            </div>
                            <div class="card-body text-center">
                                ${data.evolution.seal.image_url ? 
                                    `<img src="${data.evolution.seal.image_url}" alt="小篆" class="etymology-image mb-2" style="max-width: 80px; max-height: 80px;">` : 
                                    '<div class="text-muted mb-2">暂无图片</div>'
                                }
                                <p class="small">${data.evolution.seal.description || '暂无描述'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-3 text-center">
                    <small class="text-muted">
                        数据获取时间: ${new Date(data.fetched_at).toLocaleString('zh-CN')} | 
                        成功获取: ${data.success_count}/3 个时期
                    </small>
                </div>
            </div>
        `;
        
        etymologyContainer.innerHTML = html;
    }

    showCharacterNotFound() {
        document.getElementById('hanzi-writer').innerHTML = 
            '<div class="text-center text-muted"><p>字符信息未找到</p></div>';
        
        document.getElementById('animate-btn').disabled = true;
        document.getElementById('animate-slow-btn').disabled = true;
        
        this.currentStoryHtml = null;
    }

    showStrokeOrderNotAvailable() {
        document.getElementById('hanzi-writer').innerHTML = 
            '<div class="text-center text-muted"><p>笔顺数据不可用</p></div>';
        
        document.getElementById('animate-btn').disabled = true;
        document.getElementById('animate-slow-btn').disabled = true;
    }

    resetTabs() {
        // Reset to stroke tab
        document.getElementById('stroke-tab').click();
        
        // Clear story content
        document.getElementById('char-story').innerHTML = 
            '<p class="text-muted">加载中...</p>';
        
        // Clear etymology content
        document.getElementById('char-etymology').innerHTML = 
            '<p class="text-muted">加载中...</p>';
    }
}

class YouTubeLoader {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.video-placeholder').forEach(placeholder => {
            placeholder.addEventListener('click', (e) => {
                const videoId = e.currentTarget.dataset.videoId;
                this.loadVideo(e.currentTarget, videoId);
            });
        });
    }

    loadVideo(placeholder, videoId) {
        const iframe = document.createElement('iframe');
        iframe.className = 'youtube-iframe';
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        placeholder.parentNode.replaceChild(iframe, placeholder);
    }
}

class ReadingStats {
    constructor() {
        this.recordedSentences = new Set();
        this.init();
    }

    init() {
        // Record view stats for sentences when they come into view
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const sentenceId = entry.target.dataset.sentenceId;
                    if (sentenceId && !this.recordedSentences.has(sentenceId)) {
                        this.recordSentenceView(sentenceId);
                        this.recordedSentences.add(sentenceId);
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        document.querySelectorAll('.sentence-group').forEach(sentence => {
            observer.observe(sentence);
        });
    }

    async recordSentenceView(sentenceId) {
        try {
            await fetch('/api/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sentence_id: sentenceId
                })
            });
        } catch (error) {
            // Silently fail - stats are not critical
            console.log('Stats recording failed:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CharacterModal();
    new YouTubeLoader();
    new ReadingStats();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Left arrow key - previous chapter
    if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
        const prevLink = document.querySelector('a[href*="/reader/"][href*="←"]');
        if (prevLink) {
            window.location.href = prevLink.href;
        }
    }
    
    // Right arrow key - next chapter
    if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
        const nextLink = document.querySelector('a[href*="/reader/"][href*="→"]');
        if (nextLink) {
            window.location.href = nextLink.href;
        }
    }
    
    // Escape key - close modal
    if (e.key === 'Escape') {
        const modal = bootstrap.Modal.getInstance(document.getElementById('charModal'));
        if (modal) {
            modal.hide();
        }
    }
});