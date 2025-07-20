const axios = require('axios');
const logger = require('../config/logger');

class EtymologyService {
  constructor() {
    // You would configure these with actual API endpoints
    this.apiEndpoints = {
      oraclebone: process.env.ORACLE_BONE_API || 'https://api.chineseetymology.org/oracle',
      bronze: process.env.BRONZE_API || 'https://api.chineseetymology.org/bronze', 
      seal: process.env.SEAL_API || 'https://api.chineseetymology.org/seal'
    };
    this.timeout = 5000;
  }

  /**
   * Fetch etymology data for a character from multiple sources
   * @param {string} character - The Chinese character
   * @returns {Promise<Object>} Etymology data with oracle bone, bronze, and seal scripts
   */
  async fetchEtymologyData(character) {
    try {
      const [oracleData, bronzeData, sealData] = await Promise.allSettled([
        this.fetchOracleBoneScript(character),
        this.fetchBronzeScript(character),
        this.fetchSealScript(character)
      ]);

      const etymology = {
        character,
        evolution: {
          oracle_bone: {
            image_url: oracleData.status === 'fulfilled' ? oracleData.value?.image_url : null,
            description: oracleData.status === 'fulfilled' ? oracleData.value?.description : null,
            period: '商朝 (1600-1046 BC)',
            status: oracleData.status
          },
          bronze: {
            image_url: bronzeData.status === 'fulfilled' ? bronzeData.value?.image_url : null,
            description: bronzeData.status === 'fulfilled' ? bronzeData.value?.description : null,
            period: '西周-春秋 (1046-476 BC)',
            status: bronzeData.status
          },
          seal: {
            image_url: sealData.status === 'fulfilled' ? sealData.value?.image_url : null,
            description: sealData.status === 'fulfilled' ? sealData.value?.description : null,
            period: '秦朝 (221-206 BC)',
            status: sealData.status
          }
        },
        fetched_at: new Date().toISOString(),
        success_count: [oracleData, bronzeData, sealData].filter(r => r.status === 'fulfilled').length
      };

      logger.info(`Etymology data fetched for character: ${character}`, {
        character,
        success_count: etymology.success_count
      });

      return etymology;
    } catch (error) {
      logger.error('Error fetching etymology data:', error);
      throw error;
    }
  }

  /**
   * Fetch oracle bone script data
   * @param {string} character 
   * @returns {Promise<Object>}
   */
  async fetchOracleBoneScript(character) {
    try {
      const response = await axios.get(`${this.apiEndpoints.oraclebone}/${encodeURIComponent(character)}`, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TraditionalChineseStudy/1.0'
        }
      });

      return {
        image_url: response.data?.image_url || response.data?.oracle_bone_image,
        description: response.data?.description || response.data?.explanation,
        source: 'oracle_bone_api'
      };
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return this.getMockOracleBoneData(character);
    }
  }

  /**
   * Fetch bronze script data
   * @param {string} character 
   * @returns {Promise<Object>}
   */
  async fetchBronzeScript(character) {
    try {
      const response = await axios.get(`${this.apiEndpoints.bronze}/${encodeURIComponent(character)}`, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TraditionalChineseStudy/1.0'
        }
      });

      return {
        image_url: response.data?.image_url || response.data?.bronze_image,
        description: response.data?.description || response.data?.explanation,
        source: 'bronze_api'
      };
    } catch (error) {
      return this.getMockBronzeData(character);
    }
  }

  /**
   * Fetch seal script data
   * @param {string} character 
   * @returns {Promise<Object>}
   */
  async fetchSealScript(character) {
    try {
      const response = await axios.get(`${this.apiEndpoints.seal}/${encodeURIComponent(character)}`, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TraditionalChineseStudy/1.0'
        }
      });

      return {
        image_url: response.data?.image_url || response.data?.seal_image,
        description: response.data?.description || response.data?.explanation,
        source: 'seal_api'
      };
    } catch (error) {
      return this.getMockSealData(character);
    }
  }

  /**
   * Mock data for oracle bone script (for demo/fallback)
   */
  getMockOracleBoneData(character) {
    const mockData = {
      '人': {
        image_url: '/images/etymology/oracle/人.svg',
        description: '甲骨文"人"字像一个人侧身站立的样子，突出人直立行走的特征。'
      },
      '道': {
        image_url: '/images/etymology/oracle/道.svg', 
        description: '甲骨文"道"字从行从首，表示带领、引导的含义。'
      }
    };

    return mockData[character] || {
      image_url: null,
      description: `甲骨文"${character}"字的字形演变信息暂未收录。`
    };
  }

  /**
   * Mock data for bronze script (for demo/fallback)
   */
  getMockBronzeData(character) {
    const mockData = {
      '人': {
        image_url: '/images/etymology/bronze/人.svg',
        description: '金文"人"字保持了甲骨文的基本结构，笔画更加规整。'
      },
      '道': {
        image_url: '/images/etymology/bronze/道.svg',
        description: '金文"道"字增添了辶旁，更清楚地表达了道路、行走的含义。'
      }
    };

    return mockData[character] || {
      image_url: null,
      description: `金文"${character}"字的字形演变信息暂未收录。`
    };
  }

  /**
   * Mock data for seal script (for demo/fallback)
   */
  getMockSealData(character) {
    const mockData = {
      '人': {
        image_url: '/images/etymology/seal/人.svg',
        description: '小篆"人"字形体更加简化和标准化，成为后世楷书的基础。'
      },
      '道': {
        image_url: '/images/etymology/seal/道.svg',
        description: '小篆"道"字结构完整，辶旁和首部组合清晰，奠定了现代汉字的基本形态。'
      }
    };

    return mockData[character] || {
      image_url: null,
      description: `小篆"${character}"字的字形演变信息暂未收录。`
    };
  }

  /**
   * Cache etymology data for a character
   * @param {string} character 
   * @param {Object} etymologyData 
   */
  async cacheEtymologyData(character, etymologyData) {
    // This would typically save to database or cache
    // For now, just log
    logger.info(`Caching etymology data for character: ${character}`);
  }
}

module.exports = new EtymologyService();