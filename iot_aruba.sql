/*
 Navicat Premium Data Transfer

 Source Server         : pod_mysql
 Source Server Type    : MySQL
 Source Server Version : 90001 (9.0.1)
 Source Host           : localhost:3306
 Source Schema         : iot_aruba

 Target Server Type    : MySQL
 Target Server Version : 90001 (9.0.1)
 File Encoding         : 65001

 Date: 03/06/2025 10:06:30
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ap_inventory
-- ----------------------------
DROP TABLE IF EXISTS `ap_inventory`;
CREATE TABLE `ap_inventory`  (
  `ap_no` int NOT NULL AUTO_INCREMENT,
  `ap_name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `ap_macaddress` varchar(48) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `ap_building` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `ap_number` int NULL DEFAULT NULL,
  `ap_model` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `ap_note` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`ap_no`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for sensors
-- ----------------------------
DROP TABLE IF EXISTS `sensors`;
CREATE TABLE `sensors`  (
  `s_no` int NOT NULL AUTO_INCREMENT,
  `s_uuid` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `s_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `s_mac_address` varchar(48) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `s_device_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL,
  `s_major` int NULL DEFAULT NULL,
  `s_minor` int NULL DEFAULT NULL,
  `s_battery` int NULL DEFAULT NULL,
  `s_dynamic_value` int NULL DEFAULT NULL,
  `s_tx_power` int NULL DEFAULT NULL,
  `s_rssi` int NULL DEFAULT NULL,
  `s_timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ap_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ap_mac_address` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ap_hw_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`s_no`) USING BTREE,
  INDEX `idx_ap_mac_address`(`ap_mac_address` ASC) USING BTREE,
  INDEX `idx_s_timestamp`(`s_timestamp` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 696 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
