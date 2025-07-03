/*
 Navicat Premium Dump SQL

 Source Server         : YCrispBiscuit
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : ycrispbiscuittools

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 03/07/2025 17:44:29
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
  `ACGN_Personal_Preference_Table_Generator_Main_Content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '主要内容，记录表格每个格子的类型',
  `Data_Source_Number` int NULL DEFAULT NULL COMMENT '对应的资源库内Item的数量，通过查询Item_ID的数量来确定',
  PRIMARY KEY (`ACGN_Personal_Preference_Table_Generator_ID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of acgn_personal_preference_table_generator
-- ----------------------------

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
  INDEX `key1`(`ACGN_Personal_Preference_Table_Generator_ID` ASC) USING BTREE,
  CONSTRAINT `key1` FOREIGN KEY (`ACGN_Personal_Preference_Table_Generator_ID`) REFERENCES `acgn_personal_preference_table_generator` (`ACGN_Personal_Preference_Table_Generator_ID`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of data_source_acgn_personal_preference_table_generator
-- ----------------------------

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

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
