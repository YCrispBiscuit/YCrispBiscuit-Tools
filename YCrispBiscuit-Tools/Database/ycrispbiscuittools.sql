/*
 Navicat Premium Data Transfer

 Source Server         : YCrispBiscuit
 Source Server Type    : MySQL
 Source Server Version : 80042
 Source Host           : localhost:3306
 Source Schema         : ycrispbiscuittools

 Target Server Type    : MySQL
 Target Server Version : 80042
 File Encoding         : 65001

 Date: 06/07/2025 18:36:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for acgn_personal_preference_table_generator
-- ----------------------------
DROP TABLE IF EXISTS `acgn_personal_preference_table_generator`;
CREATE TABLE `acgn_personal_preference_table_generator`  (
  `ACGN_Personal_Preference_Table_Generator_ID` int NOT NULL COMMENT '喜好表ID',
  `ACGN_Personal_Preference_Table_Generator_Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '喜好表名称',
  `ACGN_Personal_Preference_Table_Generator_Main_Content` json NULL COMMENT '主要内容，记录表格每个格子的类型',
  `Data_Source_Number` int NULL DEFAULT NULL COMMENT '对应的资源库内Item的数量，通过查询Item_ID的数量来确定',
  PRIMARY KEY (`ACGN_Personal_Preference_Table_Generator_ID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of acgn_personal_preference_table_generator
-- ----------------------------
INSERT INTO `acgn_personal_preference_table_generator` VALUES (1, 'Genshin Impact', '[\"最喜欢的\", \"最讨厌的\", \"最常用的\", \"最想抽到的\", \"最冷门的\", \"最强的\", \"最弱的\", \"最可爱的\", \"最帅的\", \"最治愈的\", \"最高冷的\", \"最热情的\", \"最风雅的\", \"想看ta性转\", \"想变成ta的\"]', 112);
INSERT INTO `acgn_personal_preference_table_generator` VALUES (2, 'Honkai: Star Rail', '[\"最喜欢的\", \"最讨厌的\", \"最常用的\", \"最想抽到的\", \"最冷门的\", \"最强的\", \"最弱的\", \"最可爱的\", \"最帅的\", \"最治愈的\", \"最高冷的\", \"最热情的\", \"最风雅的\", \"想看ta性转\", \"想变成ta的\"]', 80);
INSERT INTO `acgn_personal_preference_table_generator` VALUES (3, 'ZenlessZoneZero', '[\"最喜欢的\", \"最讨厌的\", \"最常用的\", \"最想抽到的\", \"最冷门的\", \"最强的\", \"最弱的\", \"最可爱的\", \"最帅的\", \"最治愈的\", \"最高冷的\", \"最热情的\", \"最风雅的\", \"想看ta性转\", \"想变成ta的\"]', 38);

-- ----------------------------
-- Table structure for data_source_acgn_personal_preference_table_generator
-- ----------------------------
DROP TABLE IF EXISTS `data_source_acgn_personal_preference_table_generator`;
CREATE TABLE `data_source_acgn_personal_preference_table_generator`  (
  `Data_Source_ACGN_Personal_Preference_Table_Generator_ID` int NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `ACGN_Personal_Preference_Table_Generator_ID` int NULL DEFAULT NULL COMMENT '外键，属于哪个喜好表，关联ACGN_Personal_Preference_Table_Generator',
  `Item_Picture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图片',
  `Item_Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '名称',
  `Item_ID` int NULL DEFAULT NULL COMMENT '喜好表内ID，表内ID按理来说不重复，但此处不知道该怎么设置了',
  PRIMARY KEY (`Data_Source_ACGN_Personal_Preference_Table_Generator_ID`) USING BTREE,
  INDEX `key1`(`ACGN_Personal_Preference_Table_Generator_ID`) USING BTREE,
  CONSTRAINT `key1` FOREIGN KEY (`ACGN_Personal_Preference_Table_Generator_ID`) REFERENCES `acgn_personal_preference_table_generator` (`ACGN_Personal_Preference_Table_Generator_ID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of data_source_acgn_personal_preference_table_generator
-- ----------------------------
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (1, 1, 'resources/GenshinImpact/505417.png', '丝柯克', 505417);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (2, 1, 'resources/GenshinImpact/3386.png', '申鹤', 3386);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (3, 1, 'resources/GenshinImpact/505418.png', '塔利雅', 505418);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (4, 1, 'resources/GenshinImpact/4781.png', '坎蒂丝', 4781);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (5, 1, 'resources/GenshinImpact/1221.png', '迪奥娜', 1221);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (6, 1, 'resources/GenshinImpact/501624.png', '基尼奇', 501624);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (7, 1, 'resources/GenshinImpact/2404.png', '雷电将军', 2404);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (8, 1, 'resources/GenshinImpact/2123.png', '神里绫华', 2123);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (9, 1, 'resources/GenshinImpact/3875.png', '神里绫人', 3875);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (10, 1, 'resources/GenshinImpact/500987.png', '千织', 500987);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (11, 1, 'resources/GenshinImpact/3564.png', '八重神子', 3564);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (12, 1, 'resources/GenshinImpact/3276.png', '荒泷一斗', 3276);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (13, 1, 'resources/GenshinImpact/2124.png', '宵宫', 2124);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (14, 1, 'resources/GenshinImpact/6938.png', '琳妮特', 6938);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (15, 1, 'resources/GenshinImpact/2402.png', '九条裟罗', 2402);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (16, 1, 'resources/GenshinImpact/504976.png', '爱可菲', 504976);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (17, 1, 'resources/GenshinImpact/2606.png', '托马', 2606);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (18, 1, 'resources/GenshinImpact/500419.png', '娜维娅', 500419);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (19, 1, 'resources/GenshinImpact/504977.png', '伊法', 504977);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (20, 1, 'resources/GenshinImpact/502927.png', '欧洛伦', 502927);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (21, 1, 'resources/GenshinImpact/5297.png', '莱依拉', 5297);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (22, 1, 'resources/GenshinImpact/502306.png', '希诺宁', 502306);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (23, 1, 'resources/GenshinImpact/57.png', '温迪', 57);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (24, 1, 'resources/GenshinImpact/5493.png', '珐露珊', 5493);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (25, 1, 'resources/GenshinImpact/1795.png', '烟绯', 1795);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (26, 1, 'resources/GenshinImpact/4073.png', '旅行者·火 ', 4073);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (27, 1, 'resources/GenshinImpact/4074.png', '旅行者·火', 4074);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (28, 1, 'resources/GenshinImpact/505505.png', '旅行者·水', 505505);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (29, 1, 'resources/GenshinImpact/505500.png', '旅行者·水', 505500);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (30, 1, 'resources/GenshinImpact/505498.png', '旅行者·草', 505498);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (31, 1, 'resources/GenshinImpact/505502.png', '旅行者·草', 505502);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (32, 1, 'resources/GenshinImpact/505496.png', '旅行者·雷', 505496);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (33, 1, 'resources/GenshinImpact/505503.png', '旅行者·雷', 505503);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (34, 1, 'resources/GenshinImpact/505497.png', '旅行者·岩', 505497);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (35, 1, 'resources/GenshinImpact/505501.png', '旅行者·岩', 505501);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (36, 1, 'resources/GenshinImpact/505504.png', '旅行者·风', 505504);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (37, 1, 'resources/GenshinImpact/505499.png', '旅行者·风', 505499);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (38, 1, 'resources/GenshinImpact/504621.png', '伊安珊', 504621);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (39, 1, 'resources/GenshinImpact/500673.png', '闲云', 500673);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (40, 1, 'resources/GenshinImpact/79.png', '北斗', 79);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (41, 1, 'resources/GenshinImpact/504570.png', '瓦雷莎', 504570);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (42, 1, 'resources/GenshinImpact/500672.png', '嘉明', 500672);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (43, 1, 'resources/GenshinImpact/500605.png', '夏沃蕾', 500605);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (44, 1, 'resources/GenshinImpact/500291.png', '芙宁娜', 500291);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (45, 1, 'resources/GenshinImpact/500286.png', '莱欧斯利', 500286);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (46, 1, 'resources/GenshinImpact/504440.png', '梦见月瑞希', 504440);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (47, 1, 'resources/GenshinImpact/501214.png', '希格雯', 501214);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (48, 1, 'resources/GenshinImpact/503614.png', '蓝砚', 503614);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (49, 1, 'resources/GenshinImpact/501157.png', '阿蕾奇诺', 501157);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (50, 1, 'resources/GenshinImpact/501213.png', '克洛琳德', 501213);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (51, 1, 'resources/GenshinImpact/6489.png', '白术', 6489);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (52, 1, 'resources/GenshinImpact/1058.png', '刻晴', 1058);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (53, 1, 'resources/GenshinImpact/1433.png', '甘雨', 1433);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (54, 1, 'resources/GenshinImpact/1056.png', '七七', 1056);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (55, 1, 'resources/GenshinImpact/1220.png', '达达利亚', 1220);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (56, 1, 'resources/GenshinImpact/1498.png', '魈', 1498);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (57, 1, 'resources/GenshinImpact/503613.png', '玛薇卡', 503613);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (58, 1, 'resources/GenshinImpact/503612.png', '茜特菈莉', 503612);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (59, 1, 'resources/GenshinImpact/500207.png', '那维莱特', 500207);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (60, 1, 'resources/GenshinImpact/1290.png', '钟离', 1290);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (61, 1, 'resources/GenshinImpact/502928.png', '恰斯卡', 502928);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (62, 1, 'resources/GenshinImpact/5111.png', '纳西妲', 5111);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (63, 1, 'resources/GenshinImpact/1627.png', '胡桃', 1627);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (64, 1, 'resources/GenshinImpact/501625.png', '玛拉妮', 501625);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (65, 1, 'resources/GenshinImpact/501626.png', '卡齐娜', 501626);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (66, 1, 'resources/GenshinImpact/2142.png', '枫原万叶', 2142);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (67, 1, 'resources/GenshinImpact/4334.png', '提纳里', 4334);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (68, 1, 'resources/GenshinImpact/6180.png', '迪希雅', 6180);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (69, 1, 'resources/GenshinImpact/59.png', '琴', 59);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (70, 1, 'resources/GenshinImpact/75.png', '迪卢克', 75);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (71, 1, 'resources/GenshinImpact/1057.png', '莫娜', 1057);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (72, 1, 'resources/GenshinImpact/501441.png', '艾梅莉埃', 501441);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (73, 1, 'resources/GenshinImpact/4081.png', '夜兰', 4081);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (74, 1, 'resources/GenshinImpact/5020.png', '妮露', 5020);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (75, 1, 'resources/GenshinImpact/5865.png', '艾尔海森', 5865);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (76, 1, 'resources/GenshinImpact/6937.png', '林尼', 6937);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (77, 1, 'resources/GenshinImpact/4780.png', '赛诺', 4780);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (78, 1, 'resources/GenshinImpact/5494.png', '流浪者', 5494);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (79, 1, 'resources/GenshinImpact/1360.png', '阿贝多', 1360);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (80, 1, 'resources/GenshinImpact/2040.png', '优菈', 2040);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (81, 1, 'resources/GenshinImpact/2403.png', '珊瑚宫心海', 2403);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (82, 1, 'resources/GenshinImpact/55.png', '可莉', 55);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (83, 1, 'resources/GenshinImpact/111.png', '诺艾尔', 111);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (84, 1, 'resources/GenshinImpact/1744.png', '罗莎莉亚', 1744);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (85, 1, 'resources/GenshinImpact/501212.png', '赛索斯', 501212);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (86, 1, 'resources/GenshinImpact/500292.png', '夏洛蒂', 500292);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (87, 1, 'resources/GenshinImpact/7257.png', '菲米尼', 7257);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (88, 1, 'resources/GenshinImpact/6594.png', '绮良良', 6594);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (89, 1, 'resources/GenshinImpact/6490.png', '卡维', 6490);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (90, 1, 'resources/GenshinImpact/6285.png', '米卡', 6285);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (91, 1, 'resources/GenshinImpact/5866.png', '瑶瑶', 5866);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (92, 1, 'resources/GenshinImpact/4736.png', '多莉', 4736);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (93, 1, 'resources/GenshinImpact/4333.png', '柯莱', 4333);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (94, 1, 'resources/GenshinImpact/4197.png', '鹿野院平藏', 4197);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (95, 1, 'resources/GenshinImpact/4148.png', '久岐忍', 4148);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (96, 1, 'resources/GenshinImpact/3387.png', '云堇', 3387);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (97, 1, 'resources/GenshinImpact/3275.png', '五郎', 3275);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (98, 1, 'resources/GenshinImpact/2125.png', '早柚', 2125);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (99, 1, 'resources/GenshinImpact/78.png', '凝光', 78);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (100, 1, 'resources/GenshinImpact/382.png', '菲谢尔', 382);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (101, 1, 'resources/GenshinImpact/105.png', '班尼特', 105);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (102, 1, 'resources/GenshinImpact/92.png', '丽莎', 92);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (103, 1, 'resources/GenshinImpact/241.png', '行秋', 241);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (104, 1, 'resources/GenshinImpact/54.png', '安柏', 54);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (105, 1, 'resources/GenshinImpact/644.png', '重云', 644);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (106, 1, 'resources/GenshinImpact/56.png', '雷泽', 56);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (107, 1, 'resources/GenshinImpact/61.png', '芭芭拉', 61);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (108, 1, 'resources/GenshinImpact/112.png', '香菱', 112);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (109, 1, 'resources/GenshinImpact/76.png', '凯亚', 76);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (110, 1, 'resources/GenshinImpact/1055.png', '砂糖', 1055);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (111, 1, 'resources/GenshinImpact/1291.png', '辛焱', 1291);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (112, 1, 'resources/GenshinImpact/2415.png', '埃洛伊', 2415);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (113, 2, 'resources/HonkaiStarRail/5107.png', '白厄', 5107);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (114, 2, 'resources/HonkaiStarRail/4608.png', '缇宝', 4608);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (115, 2, 'resources/HonkaiStarRail/4174.png', '星期日', 4174);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (116, 2, 'resources/HonkaiStarRail/2087.png', '花火', 2087);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (117, 2, 'resources/HonkaiStarRail/1085.png', '银狼', 1085);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (118, 2, 'resources/HonkaiStarRail/1214.png', '刃', 1214);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (119, 2, 'resources/HonkaiStarRail/1298.png', '卡芙卡', 1298);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (120, 2, 'resources/HonkaiStarRail/1708.png', '镜流', 1708);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (121, 2, 'resources/HonkaiStarRail/5339.png', 'Saber', 5339);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (122, 2, 'resources/HonkaiStarRail/5338.png', 'Archer', 5338);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (123, 2, 'resources/HonkaiStarRail/5583.png', '刻律德菈', 5583);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (124, 2, 'resources/HonkaiStarRail/5582.png', '海瑟音', 5582);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (125, 2, 'resources/HonkaiStarRail/5109.png', '赛飞儿', 5109);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (126, 2, 'resources/HonkaiStarRail/4440.png', '阿格莱雅', 4440);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (127, 2, 'resources/HonkaiStarRail/5108.png', '风堇', 5108);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (128, 2, 'resources/HonkaiStarRail/4439.png', '大黑塔', 4439);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (129, 2, 'resources/HonkaiStarRail/4917.png', '那刻夏', 4917);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (130, 2, 'resources/HonkaiStarRail/1873.png', '真理医生', 1873);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (131, 2, 'resources/HonkaiStarRail/4916.png', '遐蝶', 4916);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (132, 2, 'resources/HonkaiStarRail/4175.png', '忘归人', 4175);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (133, 3, 'resources/ZenlessZoneZero/1301.png', '橘福福', 1301);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (134, 3, 'resources/ZenlessZoneZero/1299.png', '仪玄', 1299);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (135, 3, 'resources/ZenlessZoneZero/1300.png', '潘引壶', 1300);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (136, 3, 'resources/ZenlessZoneZero/801.png', '凯撒·金', 801);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (137, 3, 'resources/ZenlessZoneZero/1386.png', '浮波 柚叶', 1386);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (138, 3, 'resources/ZenlessZoneZero/1385.png', '爱丽丝·泰姆菲尔德', 1385);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (139, 3, 'resources/ZenlessZoneZero/317.png', '艾莲·乔', 317);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (140, 3, 'resources/ZenlessZoneZero/1290.png', '雨果·维拉德', 1290);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (141, 3, 'resources/ZenlessZoneZero/1276.png', '薇薇安·班希', 1276);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (142, 3, 'resources/ZenlessZoneZero/1230.png', '「扳机」', 1230);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (143, 3, 'resources/ZenlessZoneZero/1190.png', '零号·安比', 1190);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (144, 3, 'resources/ZenlessZoneZero/1158.png', '伊芙琳·舒瓦利耶', 1158);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (145, 3, 'resources/ZenlessZoneZero/1109.png', '耀嘉音', 1109);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (146, 3, 'resources/ZenlessZoneZero/996.png', '星见 雅', 996);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (147, 3, 'resources/ZenlessZoneZero/997.png', '浅羽 悠真', 997);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (148, 3, 'resources/ZenlessZoneZero/950.png', '莱特', 950);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (149, 3, 'resources/ZenlessZoneZero/916.png', '月城 柳', 916);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (150, 3, 'resources/ZenlessZoneZero/840.png', '柏妮思·怀特', 840);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (151, 3, 'resources/ZenlessZoneZero/759.png', '简·杜', 759);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (152, 3, 'resources/ZenlessZoneZero/680.png', '青衣', 680);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (153, 2, 'resources/HonkaiStarRail/3058.png', '椒丘', 3058);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (154, 2, 'resources/HonkaiStarRail/2300.png', '黄泉', 2300);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (155, 2, 'resources/HonkaiStarRail/4609.png', '万敌', 4609);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (156, 2, 'resources/HonkaiStarRail/1712.png', '藿藿', 1712);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (157, 2, 'resources/HonkaiStarRail/3056.png', '云璃', 3056);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (158, 2, 'resources/HonkaiStarRail/2526.png', '波提欧', 2526);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (159, 2, 'resources/HonkaiStarRail/2524.png', '知更鸟', 2524);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (160, 2, 'resources/HonkaiStarRail/4442.png', '开拓者•记忆', 4442);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (161, 2, 'resources/HonkaiStarRail/4441.png', '开拓者•记忆', 4441);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (162, 2, 'resources/HonkaiStarRail/3502.png', '灵砂', 3502);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (163, 2, 'resources/HonkaiStarRail/3501.png', '飞霄', 3501);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (164, 2, 'resources/HonkaiStarRail/2675.png', '翡翠', 2675);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (165, 2, 'resources/HonkaiStarRail/2674.png', '流萤', 2674);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (166, 2, 'resources/HonkaiStarRail/389.png', '景元', 389);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (167, 2, 'resources/HonkaiStarRail/2302.png', '砂金', 2302);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (168, 2, 'resources/HonkaiStarRail/3732.png', '乱破', 3732);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (169, 2, 'resources/HonkaiStarRail/2082.png', '黑天鹅', 2082);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (170, 2, 'resources/HonkaiStarRail/1472.png', '丹恒•饮月', 1472);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (171, 2, 'resources/HonkaiStarRail/1874.png', '阮•梅', 1874);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (172, 2, 'resources/HonkaiStarRail/1714.png', '银枝', 1714);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (173, 2, 'resources/HonkaiStarRail/564.png', '白露', 564);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (174, 2, 'resources/HonkaiStarRail/565.png', '彦卿', 565);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (175, 2, 'resources/HonkaiStarRail/1646.png', '符玄', 1646);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (176, 2, 'resources/HonkaiStarRail/1188.png', '罗刹', 1188);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (177, 2, 'resources/HonkaiStarRail/1709.png', '托帕&账账', 1709);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (178, 2, 'resources/HonkaiStarRail/414.png', '克拉拉', 414);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (179, 2, 'resources/HonkaiStarRail/424.png', '杰帕德', 424);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (180, 2, 'resources/HonkaiStarRail/317.png', '希儿', 317);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (181, 2, 'resources/HonkaiStarRail/453.png', '布洛妮娅', 453);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (182, 2, 'resources/HonkaiStarRail/560.png', '瓦尔特', 560);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (183, 2, 'resources/HonkaiStarRail/407.png', '姬子', 407);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (184, 2, 'resources/HonkaiStarRail/411.png', '开拓者•同谐', 411);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (185, 2, 'resources/HonkaiStarRail/872.png', '开拓者•同谐', 872);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (186, 2, 'resources/HonkaiStarRail/3127.png', '开拓者•存护', 3127);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (187, 2, 'resources/HonkaiStarRail/3123.png', '开拓者•存护', 3123);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (188, 2, 'resources/HonkaiStarRail/3128.png', '开拓者•毁灭', 3128);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (189, 2, 'resources/HonkaiStarRail/3124.png', '开拓者•毁灭', 3124);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (190, 2, 'resources/HonkaiStarRail/2086.png', '米沙', 2086);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (191, 2, 'resources/HonkaiStarRail/2304.png', '加拉赫', 2304);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (192, 2, 'resources/HonkaiStarRail/3121.png', '仙舟三月七', 3121);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (193, 2, 'resources/HonkaiStarRail/3505.png', '貊泽', 3505);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (194, 2, 'resources/HonkaiStarRail/1717.png', '寒鸦', 1717);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (195, 2, 'resources/HonkaiStarRail/1872.png', '雪衣', 1872);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (196, 2, 'resources/HonkaiStarRail/1710.png', '桂乃芬', 1710);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (197, 2, 'resources/HonkaiStarRail/1187.png', '驭空', 1187);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (198, 2, 'resources/HonkaiStarRail/412.png', '素裳', 412);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (199, 2, 'resources/HonkaiStarRail/561.png', '停云', 561);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (200, 2, 'resources/HonkaiStarRail/497.png', '青雀', 497);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (201, 2, 'resources/HonkaiStarRail/1325.png', '卢卡', 1325);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (202, 2, 'resources/HonkaiStarRail/1543.png', '玲可', 1543);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (203, 2, 'resources/HonkaiStarRail/76.png', '虎克', 76);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (204, 2, 'resources/HonkaiStarRail/386.png', '桑博', 386);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (205, 2, 'resources/HonkaiStarRail/422.png', '佩拉', 422);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (206, 2, 'resources/HonkaiStarRail/46.png', '娜塔莎', 46);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (207, 2, 'resources/HonkaiStarRail/423.png', '希露瓦', 423);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (208, 2, 'resources/HonkaiStarRail/49.png', '黑塔', 49);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (209, 2, 'resources/HonkaiStarRail/52.png', '艾丝妲', 52);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (210, 2, 'resources/HonkaiStarRail/380.png', '阿兰', 380);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (211, 2, 'resources/HonkaiStarRail/406.png', '丹恒', 406);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (212, 2, 'resources/HonkaiStarRail/48.png', '三月七', 48);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (213, 3, 'resources/ZenlessZoneZero/634.png', '朱鸢', 634);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (214, 3, 'resources/ZenlessZoneZero/65.png', '冯·莱卡恩', 65);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (215, 3, 'resources/ZenlessZoneZero/378.png', '猫宫 又奈', 378);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (216, 3, 'resources/ZenlessZoneZero/73.png', '「11号」', 73);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (217, 3, 'resources/ZenlessZoneZero/316.png', '亚历山德丽娜·莎芭丝缇安', 316);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (218, 3, 'resources/ZenlessZoneZero/318.png', '珂蕾妲·贝洛伯格', 318);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (219, 3, 'resources/ZenlessZoneZero/150.png', '格莉丝·霍华德', 150);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (220, 3, 'resources/ZenlessZoneZero/1191.png', '波可娜·费雷尼', 1191);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (221, 3, 'resources/ZenlessZoneZero/758.png', '赛斯·洛威尔', 758);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (222, 3, 'resources/ZenlessZoneZero/493.png', '露西亚娜·德·蒙特夫', 493);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (223, 3, 'resources/ZenlessZoneZero/485.png', '派派·韦尔', 485);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (224, 3, 'resources/ZenlessZoneZero/80.png', '妮可·德玛拉', 80);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (225, 3, 'resources/ZenlessZoneZero/371.png', '比利·奇德', 371);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (226, 3, 'resources/ZenlessZoneZero/158.png', '本·比格', 158);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (227, 3, 'resources/ZenlessZoneZero/227.png', '苍角', 227);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (228, 3, 'resources/ZenlessZoneZero/379.png', '安比·德玛拉', 379);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (229, 3, 'resources/ZenlessZoneZero/179.png', '可琳·威克斯', 179);
INSERT INTO `data_source_acgn_personal_preference_table_generator` VALUES (230, 3, 'resources/ZenlessZoneZero/147.png', '安东·伊万诺夫', 147);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `UserID` int NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识ID，自增主键',
  `UserName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户昵称',
  `UserLoginPhoneNumber` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '登录手机号',
  `UserLoginPassword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '登录密码',
  `Avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户头像',
  `CreateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `LastUpDateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`UserID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------

-- ----------------------------
-- Triggers structure for table data_source_acgn_personal_preference_table_generator
-- ----------------------------
DROP TRIGGER IF EXISTS `Update_Number_After_Delete`;
delimiter ;;
CREATE TRIGGER `Update_Number_After_Delete` AFTER DELETE ON `data_source_acgn_personal_preference_table_generator` FOR EACH ROW BEGIN
  UPDATE acgn_personal_preference_table_generator
  SET Data_Source_Number = (
    SELECT COUNT(*)
    FROM data_source_acgn_personal_preference_table_generator
    WHERE ACGN_Personal_Preference_Table_Generator_ID = OLD.ACGN_Personal_Preference_Table_Generator_ID
  )
  WHERE ACGN_Personal_Preference_Table_Generator_ID = OLD.ACGN_Personal_Preference_Table_Generator_ID;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table data_source_acgn_personal_preference_table_generator
-- ----------------------------
DROP TRIGGER IF EXISTS `Update_Number_After_Insert`;
delimiter ;;
CREATE TRIGGER `Update_Number_After_Insert` AFTER INSERT ON `data_source_acgn_personal_preference_table_generator` FOR EACH ROW BEGIN
  UPDATE acgn_personal_preference_table_generator
  SET Data_Source_Number = (
    SELECT COUNT(*)
    FROM data_source_acgn_personal_preference_table_generator
    WHERE ACGN_Personal_Preference_Table_Generator_ID = NEW.ACGN_Personal_Preference_Table_Generator_ID
  )
  WHERE ACGN_Personal_Preference_Table_Generator_ID = NEW.ACGN_Personal_Preference_Table_Generator_ID;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
