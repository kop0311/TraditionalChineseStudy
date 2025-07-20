const express = require('express');
const router = express.Router();
const { AvatarSet, AvatarConfig, Child } = require('../models');
const logger = require('../config/logger');

// 获取所有头像套装
router.get('/sets', async (req, res) => {
  try {
    const avatarSets = await AvatarSet.findAll({
      where: { is_active: true },
      include: [{
        model: AvatarConfig,
        as: 'configs',
        where: { is_active: true },
        required: false
      }],
      order: [['id', 'ASC'], [{ model: AvatarConfig, as: 'configs' }, 'avatar_index', 'ASC']]
    });

    res.json(avatarSets);
  } catch (error) {
    logger.error('Error fetching avatar sets:', error);
    res.status(500).json({ error: '获取头像套装失败' });
  }
});

// 获取特定套装的头像配置
router.get('/sets/:setId/configs', async (req, res) => {
  try {
    const { setId } = req.params;
    
    const configs = await AvatarConfig.findAll({
      where: { 
        set_id: setId,
        is_active: true 
      },
      include: [{
        model: AvatarSet,
        as: 'avatarSet'
      }],
      order: [['avatar_index', 'ASC']]
    });

    res.json(configs);
  } catch (error) {
    logger.error('Error fetching avatar configs:', error);
    res.status(500).json({ error: '获取头像配置失败' });
  }
});

// 更新孩子的头像
router.post('/children/:childId/avatar', async (req, res) => {
  try {
    const { childId } = req.params;
    const { avatar_config_id } = req.body;

    // 验证头像配置是否存在
    const avatarConfig = await AvatarConfig.findByPk(avatar_config_id);
    if (!avatarConfig) {
      return res.status(404).json({ error: '头像配置不存在' });
    }

    // 查找孩子
    const child = await Child.findByPk(childId);
    if (!child) {
      return res.status(404).json({ error: '孩子信息不存在' });
    }

    // 更新孩子的头像配置
    await child.update({
      avatar_config_id: avatar_config_id,
      avatar_url: avatarConfig.preview_url
    });

    // 返回更新后的孩子信息
    const updatedChild = await Child.findByPk(childId, {
      include: [{
        model: AvatarConfig,
        as: 'avatarConfig',
        include: [{
          model: AvatarSet,
          as: 'avatarSet'
        }]
      }]
    });

    res.json(updatedChild);
  } catch (error) {
    logger.error('Error updating child avatar:', error);
    res.status(500).json({ error: '更新头像失败' });
  }
});

// 生成新的头像配置（用于刷新）
router.post('/sets/:setId/refresh', async (req, res) => {
  try {
    const { setId } = req.params;
    
    const avatarSet = await AvatarSet.findByPk(setId);
    if (!avatarSet) {
      return res.status(404).json({ error: '头像套装不存在' });
    }

    // 删除旧的配置
    await AvatarConfig.destroy({
      where: { set_id: setId }
    });

    // 生成新的配置
    const newConfigs = [];
    for (let i = 0; i < avatarSet.total_count; i++) {
      const seed = `${avatarSet.style}-${setId}-${Date.now()}-${i}`;
      const options = JSON.stringify({
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'][i % 5],
        accessories: ['none', 'prescription01', 'prescription02', 'round', 'sunglasses'][i % 5],
        clothing: ['blazerShirt', 'blazerSweater', 'collarSweater', 'graphicShirt', 'hoodie'][i % 5]
      });
      
      const previewUrl = `https://api.dicebear.com/7.x/${avatarSet.style}/svg?seed=${seed}&size=100`;

      const config = await AvatarConfig.create({
        set_id: setId,
        avatar_index: i,
        seed: seed,
        options: options,
        preview_url: previewUrl
      });

      newConfigs.push(config);
    }

    res.json(newConfigs);
  } catch (error) {
    logger.error('Error refreshing avatar set:', error);
    res.status(500).json({ error: '刷新头像套装失败' });
  }
});

module.exports = router;