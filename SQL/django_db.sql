-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Jan 07, 2026 at 03:02 AM
-- Server version: 8.0.44
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `django_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` bigint NOT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `action`, `timestamp`, `details`, `ip_address`, `admin_id`) VALUES
(1, 'Updated user details: sa1234', '2025-12-29 17:44:56.020514', NULL, NULL, 1),
(2, 'เพิ่มสินค้า: a', '2025-12-29 17:50:18.971612', NULL, NULL, 1),
(3, 'ลบสินค้า: a', '2025-12-29 17:50:32.837365', NULL, NULL, 1),
(4, 'แก้ไขสินค้า: IPHONE 17', '2025-12-29 18:08:27.403396', NULL, NULL, 1),
(5, 'แก้ไขสินค้า: IPHONE 17', '2025-12-30 01:10:35.063347', NULL, NULL, 1),
(6, 'Deleted image from product: IPHONE 17', '2025-12-30 01:42:31.011359', NULL, NULL, 1),
(7, 'แก้ไขสินค้า: IPHONE 17', '2025-12-30 01:42:39.517419', NULL, NULL, 1),
(8, 'Replied to review 1', '2025-12-30 03:45:22.236946', 'Reply: 1...', NULL, 1),
(9, 'Replied to review 2', '2025-12-30 03:45:29.233566', 'Reply: 2...', NULL, 1),
(10, 'อัปเดตสถานะออเดอร์ #22: Paid -> Pending', '2026-01-05 06:27:53.421274', NULL, NULL, 1),
(11, 'แก้ไขสินค้า: IPHONE 17', '2026-01-05 09:43:21.765049', NULL, NULL, 1),
(12, 'แก้ไขสินค้า: Watch Gold for Women', '2026-01-05 09:43:51.852623', NULL, NULL, 1),
(13, 'แก้ไขสินค้า: Watch Gold for Women', '2026-01-05 09:47:33.210796', NULL, NULL, 1),
(14, 'แก้ไขสินค้า: IPHONE 17', '2026-01-06 01:32:07.420793', NULL, NULL, 1),
(15, 'แก้ไขสินค้า: IPHONE 17', '2026-01-06 01:36:09.706219', NULL, NULL, 1),
(16, 'แก้ไขสินค้า: IPHONE 17', '2026-01-06 01:37:59.434610', NULL, NULL, 1),
(17, 'แก้ไขสินค้า: Test Product Flow', '2026-01-06 09:32:42.511650', NULL, NULL, 1),
(18, 'ลบสินค้า: Test Product Flow', '2026-01-06 09:33:10.419337', NULL, NULL, 1),
(19, 'แก้ไขสินค้า: IPHONE 17', '2026-01-06 09:33:26.348913', NULL, NULL, 1),
(20, 'แก้ไขสินค้า: IPHONE 17', '2026-01-06 09:39:30.550183', NULL, NULL, 1),
(21, 'แก้ไขสินค้า: Women\'s Wrist Watch', '2026-01-06 09:56:54.577497', NULL, NULL, 1),
(22, 'แก้ไขสินค้า: Women\'s Wrist Watch', '2026-01-06 09:57:09.830100', NULL, NULL, 1),
(23, 'อัปเดตสถานะออเดอร์ #22: Pending -> Paid', '2026-01-06 10:02:37.101311', NULL, NULL, 1),
(24, 'อัปเดตสถานะออเดอร์ #23: Pending -> Paid', '2026-01-06 10:02:44.578825', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `authtoken_token`
--

INSERT INTO `authtoken_token` (`key`, `created`, `user_id`) VALUES
('24dbe24c7e24d3ca91149dbf0af2d4651cd031d8', '2025-12-25 05:33:41.349427', 2),
('51596ff8d0efe086a4930d32af76d50fed067cba', '2026-01-06 09:26:28.114510', 8),
('8e51e977d0042ff9c3bf3175bad6820d76d46523', '2025-12-31 02:25:07.812827', 5),
('9463ba38eb4a01631735d2be56df6deba94ddf10', '2026-01-06 09:26:59.284406', 7),
('a6df3a56d030254de9c69ab480d9c2e55eeab716', '2025-12-25 03:07:14.592608', 1),
('aa52d1407df8ee73c3f29b92c0d8c578943530ff', '2025-12-29 16:38:14.924222', 4),
('df2b4523530effb6ceaa16ff1f9476f81e79cfa5', '2025-12-25 09:41:10.252141', 3);

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add Token', 6, 'add_token'),
(22, 'Can change Token', 6, 'change_token'),
(23, 'Can delete Token', 6, 'delete_token'),
(24, 'Can view Token', 6, 'view_token'),
(25, 'Can add Token', 7, 'add_tokenproxy'),
(26, 'Can change Token', 7, 'change_tokenproxy'),
(27, 'Can delete Token', 7, 'delete_tokenproxy'),
(28, 'Can view Token', 7, 'view_tokenproxy'),
(29, 'Can add product', 8, 'add_product'),
(30, 'Can change product', 8, 'change_product'),
(31, 'Can delete product', 8, 'delete_product'),
(32, 'Can view product', 8, 'view_product'),
(33, 'Can add user', 9, 'add_user'),
(34, 'Can change user', 9, 'change_user'),
(35, 'Can delete user', 9, 'delete_user'),
(36, 'Can view user', 9, 'view_user'),
(37, 'Can add admin log', 10, 'add_adminlog'),
(38, 'Can change admin log', 10, 'change_adminlog'),
(39, 'Can delete admin log', 10, 'delete_adminlog'),
(40, 'Can view admin log', 10, 'view_adminlog'),
(41, 'Can add order', 11, 'add_order'),
(42, 'Can change order', 11, 'change_order'),
(43, 'Can delete order', 11, 'delete_order'),
(44, 'Can view order', 11, 'view_order'),
(45, 'Can add order item', 12, 'add_orderitem'),
(46, 'Can change order item', 12, 'change_orderitem'),
(47, 'Can delete order item', 12, 'delete_orderitem'),
(48, 'Can view order item', 12, 'view_orderitem'),
(49, 'Can add product image', 13, 'add_productimage'),
(50, 'Can change product image', 13, 'change_productimage'),
(51, 'Can delete product image', 13, 'delete_productimage'),
(52, 'Can view product image', 13, 'view_productimage'),
(53, 'Can add review', 14, 'add_review'),
(54, 'Can change review', 14, 'change_review'),
(55, 'Can delete review', 14, 'delete_review'),
(56, 'Can view review', 14, 'view_review'),
(57, 'Can add stock history', 15, 'add_stockhistory'),
(58, 'Can change stock history', 15, 'change_stockhistory'),
(59, 'Can delete stock history', 15, 'delete_stockhistory'),
(60, 'Can view stock history', 15, 'view_stockhistory');

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int NOT NULL,
  `app_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(6, 'authtoken', 'token'),
(7, 'authtoken', 'tokenproxy'),
(4, 'contenttypes', 'contenttype'),
(10, 'myapp', 'adminlog'),
(11, 'myapp', 'order'),
(12, 'myapp', 'orderitem'),
(8, 'myapp', 'product'),
(13, 'myapp', 'productimage'),
(14, 'myapp', 'review'),
(15, 'myapp', 'stockhistory'),
(9, 'myapp', 'user'),
(5, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL,
  `app` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-12-25 02:48:49.649467'),
(2, 'contenttypes', '0002_remove_content_type_name', '2025-12-25 02:48:49.737527'),
(3, 'auth', '0001_initial', '2025-12-25 02:48:49.960948'),
(4, 'auth', '0002_alter_permission_name_max_length', '2025-12-25 02:48:50.011760'),
(5, 'auth', '0003_alter_user_email_max_length', '2025-12-25 02:48:50.016791'),
(6, 'auth', '0004_alter_user_username_opts', '2025-12-25 02:48:50.021119'),
(7, 'auth', '0005_alter_user_last_login_null', '2025-12-25 02:48:50.025473'),
(8, 'auth', '0006_require_contenttypes_0002', '2025-12-25 02:48:50.028743'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2025-12-25 02:48:50.036780'),
(10, 'auth', '0008_alter_user_username_max_length', '2025-12-25 02:48:50.042566'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2025-12-25 02:48:50.047821'),
(12, 'auth', '0010_alter_group_name_max_length', '2025-12-25 02:48:50.060214'),
(13, 'auth', '0011_update_proxy_permissions', '2025-12-25 02:48:50.066222'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2025-12-25 02:48:50.070439'),
(15, 'myapp', '0001_initial', '2025-12-25 02:48:50.714704'),
(16, 'admin', '0001_initial', '2025-12-25 02:48:50.830300'),
(17, 'admin', '0002_logentry_remove_auto_add', '2025-12-25 02:48:50.837399'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2025-12-25 02:48:50.844604'),
(19, 'authtoken', '0001_initial', '2025-12-25 02:48:50.918308'),
(20, 'authtoken', '0002_auto_20160226_1747', '2025-12-25 02:48:50.938670'),
(21, 'authtoken', '0003_tokenproxy', '2025-12-25 02:48:50.941702'),
(22, 'authtoken', '0004_alter_tokenproxy_options', '2025-12-25 02:48:50.948156'),
(23, 'sessions', '0001_initial', '2025-12-25 02:48:50.982125'),
(24, 'myapp', '0002_alter_review_options_alter_orderitem_product_and_more', '2025-12-29 16:29:34.437094'),
(25, 'myapp', '0003_review_reply_comment_review_reply_timestamp', '2025-12-30 03:38:16.452884'),
(26, 'myapp', '0004_product_seller', '2025-12-30 08:42:55.888267'),
(27, 'myapp', '0005_order_payment_date_order_slip_image', '2026-01-05 02:40:57.461521'),
(28, 'myapp', '0006_order_bank_name_order_transfer_amount_and_more', '2026-01-05 02:58:57.761280'),
(29, 'myapp', '0007_order_transfer_account_number', '2026-01-05 04:00:59.718953'),
(30, 'myapp', '0008_stockhistory', '2026-01-05 09:31:52.731333'),
(31, 'myapp', '0009_product_original_price', '2026-01-06 05:02:42.862529');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('u51lcn97xndebwh18s0m1glhfeh1i87k', '.eJxVjDEOwjAMRe-SGUWxawphZO8ZIttJSAGlUtNOiLtDpQ6w_vfef5nA61LC2tIcxmguBszhdxPWR6obiHeut8nqVJd5FLspdqfNDlNMz-vu_h0UbuVbd4ienFLOLpN68XLEKADKAIRZe3d2wI70BIm8KvcADhN2ooICYt4f13w3xQ:1vYgg7:UX3MeOG__nFolHIMsuD78OY8eGXvi7-S9vRrnzGVYXw', '2026-01-08 08:26:35.611070');

-- --------------------------------------------------------

--
-- Table structure for table `myapp_review`
--

CREATE TABLE `myapp_review` (
  `id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `reply_comment` longtext COLLATE utf8mb4_unicode_ci,
  `reply_timestamp` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `myapp_review`
--

INSERT INTO `myapp_review` (`id`, `rating`, `comment`, `created_at`, `product_id`, `user_id`, `reply_comment`, `reply_timestamp`) VALUES
(1, 5, 'DD', '2025-12-29 16:30:12.837603', 195, 2, '1', '2025-12-30 03:45:22.228137'),
(2, 5, 'DD', '2025-12-30 03:38:53.097226', 195, 2, '2', '2025-12-30 03:45:29.227092'),
(3, 5, 'DD', '2026-01-05 09:11:18.901207', 136, 2, NULL, NULL),
(4, 4, 'DD\n', '2026-01-06 07:28:28.798559', 194, 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint NOT NULL,
  `customer_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_tel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_slip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `slip_image` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_amount` decimal(12,2) DEFAULT NULL,
  `transfer_date` datetime(6) DEFAULT NULL,
  `transfer_account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_name`, `customer_tel`, `customer_email`, `shipping_address`, `total_price`, `status`, `payment_method`, `payment_slip`, `created_at`, `updated_at`, `user_id`, `payment_date`, `slip_image`, `bank_name`, `transfer_amount`, `transfer_date`, `transfer_account_number`) VALUES
(1, 'sa2020', '0895578945', 'sa2020@mail.com', 'sa', 35130.00, 'Shipped', 'Transfer', NULL, '2025-12-26 05:23:41.851909', '2025-12-30 02:36:21.659325', 2, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'sa2020', '0895578945', 'sa2020@mail.com', 'a', 35000.00, 'Shipped', 'Transfer', NULL, '2025-12-26 05:32:02.829213', '2025-12-30 01:59:29.762495', 2, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'sa2020', '0895', 'sa2020@gmail.com', 'sda', 35000.00, 'Shipped', 'Transfer', NULL, '2025-12-26 07:09:24.519125', '2025-12-30 01:59:32.554500', 2, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'sa2020', '0895', 'sa2020@gmail.com', 'sda', 59.99, 'Shipped', 'Transfer', NULL, '2025-12-26 07:14:29.642291', '2025-12-30 01:59:57.341136', 2, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'sa2020', '0895', 'sa2020@gmail.com', 'sda', 45999.99, 'Shipped', 'qr', NULL, '2025-12-26 07:25:47.473591', '2025-12-30 04:04:03.294772', 2, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'sa2020', '024555555', 'sa2020@gmail.com', 'cxz', 32999.99, 'Shipped', 'qr', NULL, '2025-12-26 07:59:30.527009', '2026-01-05 04:08:31.121901', 2, NULL, '', NULL, NULL, NULL, NULL),
(7, 'sa2020', '0212adsa', 'adas@gmail.com', 'afaf', 349.99, 'Shipped', 'Transfer', NULL, '2025-12-26 08:27:38.072007', '2026-01-05 04:08:34.202392', 2, NULL, '', NULL, NULL, NULL, NULL),
(8, 'sa2020', '0212adsa', 'adas@gmail.com', 'sa', 34.99, 'Shipped', 'Transfer', NULL, '2025-12-26 09:29:32.264394', '2026-01-05 04:08:37.341849', 2, NULL, '', NULL, NULL, NULL, NULL),
(9, 'sa2020', '0212adsa', 'adas@gmail.com', 'ass', 105000.00, 'Shipped', 'Transfer', NULL, '2025-12-28 15:55:33.915773', '2026-01-05 04:08:43.594436', 2, NULL, '', NULL, NULL, NULL, NULL),
(10, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 15999.99, 'Shipped', 'Transfer', NULL, '2025-12-29 03:27:26.063220', '2026-01-05 04:08:51.879823', 2, NULL, '', NULL, NULL, NULL, NULL),
(11, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 35000.00, 'Shipped', 'Transfer', NULL, '2025-12-31 03:01:12.115141', '2026-01-05 02:46:20.450722', 2, NULL, '', NULL, NULL, NULL, NULL),
(12, 'sa2234', '08795464', 'sa2234@gmail.com', 's\n', 130.00, 'Shipped', 'Transfer', NULL, '2025-12-31 03:01:50.648451', '2026-01-05 02:44:38.408131', 5, NULL, '', NULL, NULL, NULL, NULL),
(13, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 28999.99, 'Shipped', 'Transfer', NULL, '2026-01-05 02:41:52.844412', '2026-01-05 04:53:03.214591', 2, '2026-01-05 02:42:40.875962', 'slips/Potato_OBArYZm.webp', NULL, NULL, NULL, NULL),
(14, 'sa2234', '08795464', 'sa2234@gmail.com', 'ss', 599.99, 'Paid', 'qr', NULL, '2026-01-05 03:03:21.315273', '2026-01-05 04:08:57.913620', 5, NULL, '', NULL, NULL, NULL, NULL),
(15, 'sa2234', '08795464', 'sa2234@gmail.com', 'as', 49.99, 'Paid', 'qr', NULL, '2026-01-05 03:05:32.218084', '2026-01-05 04:09:00.690747', 5, NULL, '', NULL, NULL, NULL, NULL),
(16, 'sa2234', '08795464', 'sa2234@gmail.com', 'as', 5.99, 'Paid', 'Transfer', NULL, '2026-01-05 03:13:47.581557', '2026-01-05 04:09:04.242680', 5, NULL, '', NULL, NULL, NULL, NULL),
(17, 'sa2234', '08795464', 'sa2234@gmail.com', 'ss', 24.99, 'Paid', 'qr', NULL, '2026-01-05 03:21:32.239128', '2026-01-05 04:09:09.268996', 5, NULL, '', NULL, NULL, NULL, NULL),
(18, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 15999.99, 'Paid', 'qr', NULL, '2026-01-05 03:35:45.571422', '2026-01-05 04:11:53.665064', 2, '2026-01-05 03:56:01.861648', 'slips/Potato_OBArYZm_ULlXmF6.webp', 'KBank', 15999.99, '2026-01-05 03:49:23.567000', NULL),
(19, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 9.99, 'Paid', 'Transfer', NULL, '2026-01-05 04:04:50.649315', '2026-01-05 04:09:22.445044', 2, '2026-01-05 04:05:54.985220', 'slips/Potato_OBArYZm_FgkgJC7.webp', 'TTB', 9.99, '2026-01-05 04:04:52.009000', '2222'),
(20, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 79.99, 'Paid', 'Transfer', NULL, '2026-01-05 04:18:28.334537', '2026-01-05 04:44:20.071443', 2, '2026-01-05 04:43:17.626487', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_E91eu8J.png', 'GSB', 79.99, '2026-01-05 04:42:55.482000', '0000'),
(21, 'Test Customer', '0812345678', 'test@mail.com', '123 Test St', 500.00, 'Cancelled', 'Transfer', NULL, '2026-01-05 04:32:29.576450', '2026-01-05 04:44:16.307524', 6, NULL, '', NULL, NULL, NULL, NULL),
(22, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 499.99, 'Paid', 'Transfer', NULL, '2026-01-05 04:42:54.185937', '2026-01-06 10:02:37.100272', 2, '2026-01-05 04:42:54.328545', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0.png', 'SCB', 499.99, '2026-01-05 04:38:45.948000', '2222'),
(23, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 24.99, 'Paid', 'Transfer', NULL, '2026-01-05 07:45:05.595210', '2026-01-06 10:02:44.578044', 2, '2026-01-05 07:45:05.778986', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_Uz5QIlQ.png', 'BAY', 24.99, '2026-01-05 07:44:49.853000', '2222'),
(24, 'sa2234', '08795464', 'sa2234@gmail.com', 'as', 9.99, 'Pending', 'Transfer', NULL, '2026-01-05 08:13:10.047206', '2026-01-05 08:13:10.253187', 5, '2026-01-05 08:13:10.175620', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_EQOAggI.png', 'KBank', 9.99, '2026-01-05 08:12:08.754000', '0000'),
(25, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 12.99, 'Pending', 'Transfer', NULL, '2026-01-06 05:12:10.361808', '2026-01-06 05:12:10.644768', 2, '2026-01-06 05:12:10.565157', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_ywRC2wm.png', 'KBank', 12.99, '2026-01-06 05:11:45.547000', '1234'),
(26, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 10999.99, 'Pending', 'Transfer', NULL, '2026-01-06 06:18:32.956625', '2026-01-06 06:18:33.171158', 2, '2026-01-06 06:18:33.091613', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_hNKIKFg.png', 'SCB', 10999.99, '2026-01-06 06:18:11.413000', '2855'),
(27, 'sa2020', '02485', 'sa2020@gmail.com', 'as', 35799.98, 'Pending', 'Transfer', NULL, '2026-01-06 07:12:07.608063', '2026-01-06 07:12:07.848384', 2, '2026-01-06 07:12:07.766345', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_S4fOBpi.png', 'KBank', 35799.98, '2026-01-06 07:11:56.363000', '0000'),
(28, 'Test Customer', '0812345678', 'testrunner@example.com', '123 Test Street', 200.00, 'Pending', 'Transfer', NULL, '2026-01-06 09:27:48.541708', '2026-01-06 09:27:48.541865', 7, NULL, '', NULL, NULL, NULL, NULL),
(29, 'Test Customer', '0812345678', 'testrunner@example.com', '123 Test Street', 200.00, 'Pending', 'Transfer', NULL, '2026-01-06 09:28:32.205124', '2026-01-06 09:28:32.205325', 7, NULL, '', NULL, NULL, NULL, NULL),
(30, 'sa2020', '02485', 'sa2020@gmail.com', 'ass', 45999.99, 'Pending', 'Transfer', NULL, '2026-01-06 09:31:20.738636', '2026-01-06 09:31:20.990622', 2, '2026-01-06 09:31:20.915732', 'slips/Gemini_Generated_Image_j0z0i1j0z0i1j0z0_4moWQKd.png', 'BAY', 45999.99, '2026-01-06 09:30:34.209000', '2245');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint NOT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL
) ;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `quantity`, `price_at_purchase`, `order_id`, `product_id`) VALUES
(1, 1, 130.00, 1, 194),
(2, 1, 35000.00, 1, 195),
(3, 1, 35000.00, 2, 195),
(4, 1, 35000.00, 3, 195),
(5, 1, 59.99, 4, 176),
(6, 1, 35000.00, 5, 195),
(7, 1, 10999.99, 5, 192),
(8, 1, 32999.99, 6, 168),
(9, 1, 349.99, 7, 161),
(10, 1, 34.99, 8, 189),
(11, 3, 35000.00, 9, 195),
(12, 1, 15999.99, 10, 191),
(13, 1, 35000.00, 11, 195),
(14, 1, 130.00, 12, 194),
(15, 1, 28999.99, 13, 167),
(16, 1, 599.99, 14, 160),
(17, 1, 49.99, 15, 152),
(18, 1, 5.99, 16, 146),
(19, 1, 24.99, 17, 155),
(20, 1, 15999.99, 18, 191),
(21, 1, 9.99, 19, 148),
(22, 1, 79.99, 20, 186),
(23, 1, 499.99, 22, 136),
(24, 1, 24.99, 23, 139),
(25, 1, 9.99, 24, 120),
(26, 1, 12.99, 25, 111),
(27, 1, 10999.99, 26, 192),
(28, 1, 35000.00, 27, 195),
(29, 1, 499.99, 27, 136),
(30, 1, 299.99, 27, 135),
(31, 2, 100.00, 28, 203),
(32, 2, 100.00, 29, 203),
(33, 1, 35000.00, 30, 195),
(34, 1, 10999.99, 30, 192);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `brand` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `seller_id` bigint DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `description`, `category`, `price`, `stock`, `brand`, `thumbnail`, `rating`, `is_active`, `created_at`, `updated_at`, `seller_id`, `original_price`) VALUES
(1, 'Essence Mascara Lash Princess', 'The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.', 'beauty', 9.99, 98, 'Essence', 'products/thumb_1.jpg', 2.56, 1, '2025-12-11 03:22:24.142868', '2025-12-23 08:30:20.964715', NULL, NULL),
(2, 'Eyeshadow Palette with Mirror', 'The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it\'s convenient for on-the-go makeup application.', 'beauty', 19.99, 34, 'Glamour Beauty', 'products/thumb_2.jpg', 2.86, 1, '2025-12-11 03:22:25.898452', '2025-12-23 08:30:20.964715', NULL, NULL),
(3, 'Powder Canister', 'The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.', 'beauty', 14.99, 89, 'Velvet Touch', 'products/thumb_3.jpg', 4.64, 1, '2025-12-11 03:22:27.331094', '2025-12-23 08:30:20.964715', NULL, NULL),
(4, 'Red Lipstick', 'The Red Lipstick is a classic and bold choice for adding a pop of color to your lips. With a creamy and pigmented formula, it provides a vibrant and long-lasting finish.', 'beauty', 12.99, 90, 'Chic Cosmetics', 'products/thumb_4.jpg', 4.36, 1, '2025-12-11 03:22:28.808024', '2025-12-23 08:30:20.964715', NULL, NULL),
(5, 'Red Nail Polish', 'The Red Nail Polish offers a rich and glossy red hue for vibrant and polished nails. With a quick-drying formula, it provides a salon-quality finish at home.', 'beauty', 8.99, 77, 'Nail Couture', 'products/thumb_5.jpg', 4.32, 1, '2025-12-11 03:22:30.274110', '2025-12-23 08:30:20.964715', NULL, NULL),
(6, 'Calvin Klein CK One', 'CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent. It\'s a versatile fragrance suitable for everyday wear.', 'fragrances', 49.99, 29, 'Calvin Klein', 'products/thumb_6.jpg', 4.37, 1, '2025-12-11 03:22:31.732467', '2025-12-23 08:30:20.964715', NULL, NULL),
(7, 'Chanel Coco Noir Eau De', 'Coco Noir by Chanel is an elegant and mysterious fragrance, featuring notes of grapefruit, rose, and sandalwood. Perfect for evening occasions.', 'fragrances', 129.99, 58, 'Chanel', 'products/thumb_7.jpg', 4.26, 1, '2025-12-11 03:22:35.350992', '2025-12-23 08:30:20.964715', NULL, NULL),
(8, 'Dior J\'adore', 'J\'adore by Dior is a luxurious and floral fragrance, known for its blend of ylang-ylang, rose, and jasmine. It embodies femininity and sophistication.', 'fragrances', 89.99, 98, 'Dior', 'products/thumb_8.jpg', 3.80, 1, '2025-12-11 03:22:39.079222', '2025-12-23 08:30:20.964715', NULL, NULL),
(9, 'Dolce Shine Eau de', 'Dolce Shine by Dolce & Gabbana is a vibrant and fruity fragrance, featuring notes of mango, jasmine, and blonde woods. It\'s a joyful and youthful scent.', 'fragrances', 69.99, 4, 'Dolce & Gabbana', 'products/thumb_9.jpg', 3.96, 1, '2025-12-11 03:22:42.348337', '2025-12-23 08:30:20.964715', NULL, NULL),
(10, 'Gucci Bloom Eau de', 'Gucci Bloom by Gucci is a floral and captivating fragrance, with notes of tuberose, jasmine, and Rangoon creeper. It\'s a modern and romantic scent.', 'fragrances', 79.99, 91, 'Gucci', 'products/thumb_10.jpg', 2.74, 1, '2025-12-11 03:22:45.004451', '2025-12-23 08:30:20.964715', NULL, NULL),
(11, 'Annibale Colombo Bed', 'The Annibale Colombo Bed is a luxurious and elegant bed frame, crafted with high-quality materials for a comfortable and stylish bedroom.', 'furniture', 1899.99, 88, 'Annibale Colombo', 'products/thumb_11.jpg', 4.77, 1, '2025-12-11 03:22:47.170450', '2025-12-23 08:30:20.964715', NULL, NULL),
(12, 'Annibale Colombo Sofa', 'The Annibale Colombo Sofa is a sophisticated and comfortable seating option, featuring exquisite design and premium upholstery for your living room.', 'furniture', 2499.99, 60, 'Annibale Colombo', 'products/thumb_12.jpg', 3.92, 1, '2025-12-11 03:22:49.875198', '2025-12-23 08:30:20.964715', NULL, NULL),
(13, 'Bedside Table African Cherry', 'The Bedside Table in African Cherry is a stylish and functional addition to your bedroom, providing convenient storage space and a touch of elegance.', 'furniture', 299.99, 64, 'Furniture Co.', 'products/thumb_13.jpg', 2.87, 1, '2025-12-11 03:22:53.118621', '2025-12-23 08:30:20.964715', NULL, NULL),
(14, 'Knoll Saarinen Executive Conference Chair', 'The Knoll Saarinen Executive Conference Chair is a modern and ergonomic chair, perfect for your office or conference room with its timeless design.', 'furniture', 499.99, 26, 'Knoll', 'products/thumb_14.jpg', 4.88, 1, '2025-12-11 03:22:56.264049', '2025-12-23 08:30:20.964715', NULL, NULL),
(15, 'Wooden Bathroom Sink With Mirror', 'The Wooden Bathroom Sink with Mirror is a unique and stylish addition to your bathroom, featuring a wooden sink countertop and a matching mirror.', 'furniture', 799.99, 6, 'Bath Trends', 'products/thumb_15.jpg', 3.59, 1, '2025-12-11 03:22:58.931872', '2025-12-23 08:30:20.964715', NULL, NULL),
(16, 'Apple', 'Fresh and crisp apples, perfect for snacking or incorporating into various recipes.', 'groceries', 1.99, 8, 'Unknown', 'products/thumb_16.jpg', 4.19, 1, '2025-12-11 03:23:02.574331', '2025-12-23 08:30:20.964715', NULL, NULL),
(17, 'Beef Steak', 'High-quality beef steak, great for grilling or cooking to your preferred level of doneness.', 'groceries', 12.99, 86, 'Unknown', 'products/thumb_17.jpg', 4.47, 1, '2025-12-11 03:23:03.553455', '2025-12-23 08:30:20.964715', NULL, NULL),
(18, 'Cat Food', 'Nutritious cat food formulated to meet the dietary needs of your feline friend.', 'groceries', 8.99, 46, 'Unknown', 'products/thumb_18.jpg', 3.13, 1, '2025-12-11 03:23:04.482705', '2025-12-23 08:30:20.964715', NULL, NULL),
(19, 'Chicken Meat', 'Fresh and tender chicken meat, suitable for various culinary preparations.', 'groceries', 9.99, 97, 'Unknown', 'products/thumb_19.jpg', 3.19, 1, '2025-12-11 03:23:05.934212', '2025-12-23 08:30:20.964715', NULL, NULL),
(20, 'Cooking Oil', 'Versatile cooking oil suitable for frying, sautéing, and various culinary applications.', 'groceries', 4.99, 10, 'Unknown', 'products/thumb_20.jpg', 4.80, 1, '2025-12-11 03:23:07.777385', '2025-12-23 08:30:20.964715', NULL, NULL),
(21, 'Cucumber', 'Crisp and hydrating cucumbers, ideal for salads, snacks, or as a refreshing side.', 'groceries', 1.49, 84, 'Unknown', 'products/thumb_21.jpg', 4.07, 1, '2025-12-11 03:23:08.515982', '2025-12-23 08:30:20.964715', NULL, NULL),
(22, 'Dog Food', 'Specially formulated dog food designed to provide essential nutrients for your canine companion.', 'groceries', 10.99, 71, 'Unknown', 'products/thumb_22.jpg', 4.55, 1, '2025-12-11 03:23:10.019878', '2025-12-23 08:30:20.964715', NULL, NULL),
(23, 'Eggs', 'Fresh eggs, a versatile ingredient for baking, cooking, or breakfast.', 'groceries', 2.99, 9, 'Unknown', 'products/thumb_23_q916S8X.jpg', 2.53, 1, '2025-12-11 03:23:10.745436', '2025-12-23 08:30:20.964715', NULL, NULL),
(24, 'Fish Steak', 'Quality fish steak, suitable for grilling, baking, or pan-searing.', 'groceries', 14.99, 74, 'Unknown', 'products/thumb_24_sH7mmj1.jpg', 3.78, 1, '2025-12-11 03:23:11.695017', '2025-12-23 08:30:20.964715', NULL, NULL),
(25, 'Green Bell Pepper', 'Fresh and vibrant green bell pepper, perfect for adding color and flavor to your dishes.', 'groceries', 1.29, 33, 'Unknown', 'products/thumb_25_xJm3NzM.jpg', 3.25, 1, '2025-12-11 03:23:12.641488', '2025-12-23 08:30:20.964715', NULL, NULL),
(26, 'Green Chili Pepper', 'Spicy green chili pepper, ideal for adding heat to your favorite recipes.', 'groceries', 0.99, 3, 'Unknown', 'products/thumb_26_82qTkgn.jpg', 3.66, 1, '2025-12-11 03:23:14.269640', '2025-12-23 08:30:20.964715', NULL, NULL),
(27, 'Honey Jar', 'Pure and natural honey in a convenient jar, perfect for sweetening beverages or drizzling over food.', 'groceries', 6.99, 34, 'Unknown', 'products/thumb_27_rD2CTFK.jpg', 3.97, 1, '2025-12-11 03:23:15.716395', '2025-12-23 08:30:20.964715', NULL, NULL),
(28, 'Ice Cream', 'Creamy and delicious ice cream, available in various flavors for a delightful treat.', 'groceries', 5.49, 27, 'Unknown', 'products/thumb_28_9buyW3b.jpg', 3.39, 1, '2025-12-11 03:23:16.654502', '2025-12-23 08:30:20.964715', NULL, NULL),
(29, 'Juice', 'Refreshing fruit juice, packed with vitamins and great for staying hydrated.', 'groceries', 3.99, 50, 'Unknown', 'products/thumb_29_CNRPGKx.jpg', 3.94, 1, '2025-12-11 03:23:20.151564', '2025-12-23 08:30:20.964715', NULL, NULL),
(30, 'Kiwi', 'Nutrient-rich kiwi, perfect for snacking or adding a tropical twist to your dishes.', 'groceries', 2.49, 99, 'Unknown', 'products/thumb_30_Dp1HSir.jpg', 4.93, 1, '2025-12-11 03:23:21.073985', '2025-12-23 08:30:20.964715', NULL, NULL),
(31, 'Lemon', 'Zesty and tangy lemons, versatile for cooking, baking, or making refreshing beverages.', 'groceries', 0.79, 31, 'Unknown', 'products/thumb_31_GdJZnaM.jpg', 3.53, 1, '2025-12-11 03:23:22.024818', '2025-12-23 08:30:20.964715', NULL, NULL),
(32, 'Milk', 'Fresh and nutritious milk, a staple for various recipes and daily consumption.', 'groceries', 3.49, 27, 'Unknown', 'products/thumb_32_OgVVWEL.jpg', 2.61, 1, '2025-12-11 03:23:22.987426', '2025-12-23 08:30:20.964715', NULL, NULL),
(33, 'Mulberry', 'Sweet and juicy mulberries, perfect for snacking or adding to desserts and cereals.', 'groceries', 4.99, 99, 'Unknown', 'products/thumb_33_Sli2aOA.jpg', 4.95, 1, '2025-12-11 03:23:23.951823', '2025-12-23 08:30:20.964715', NULL, NULL),
(34, 'Nescafe Coffee', 'Quality coffee from Nescafe, available in various blends for a rich and satisfying cup.', 'groceries', 7.99, 57, 'Unknown', 'products/thumb_34_XiZrox8.jpg', 4.82, 1, '2025-12-11 03:23:25.605712', '2025-12-23 08:30:20.964715', NULL, NULL),
(35, 'Potatoes', 'Versatile and starchy potatoes, great for roasting, mashing, or as a side dish.', 'groceries', 2.29, 12, 'Unknown', 'products/thumb_35_RKfOtJJ.jpg', 4.81, 1, '2025-12-11 03:23:26.817424', '2025-12-23 08:30:20.964715', NULL, NULL),
(36, 'Protein Powder', 'Nutrient-packed protein powder, ideal for supplementing your diet with essential proteins.', 'groceries', 19.99, 79, 'Unknown', 'products/thumb_36_quALjiJ.jpg', 4.18, 1, '2025-12-11 03:23:28.056256', '2025-12-23 08:30:20.964715', NULL, NULL),
(37, 'Red Onions', 'Flavorful and aromatic red onions, perfect for adding depth to your savory dishes.', 'groceries', 1.99, 82, 'Unknown', 'products/thumb_37_lKpnenJ.jpg', 4.20, 1, '2025-12-11 03:23:29.256011', '2025-12-23 08:30:20.964715', NULL, NULL),
(38, 'Rice', 'High-quality rice, a staple for various cuisines and a versatile base for many dishes.', 'groceries', 5.99, 59, 'Unknown', 'products/thumb_38_vPh7DW8.jpg', 3.18, 1, '2025-12-11 03:23:30.451237', '2025-12-23 08:30:20.964715', NULL, NULL),
(39, 'Soft Drinks', 'Assorted soft drinks in various flavors, perfect for refreshing beverages.', 'groceries', 1.99, 53, 'Unknown', 'products/thumb_39_1PIndvY.jpg', 4.75, 1, '2025-12-11 03:23:31.660600', '2025-12-23 08:30:20.964715', NULL, NULL),
(40, 'Strawberry', 'Sweet and succulent strawberries, great for snacking, desserts, or blending into smoothies.', 'groceries', 3.99, 46, 'Unknown', 'products/thumb_40_crN9yIn.jpg', 3.08, 1, '2025-12-11 03:23:32.891879', '2025-12-23 08:30:20.964715', NULL, NULL),
(41, 'Tissue Paper Box', 'Convenient tissue paper box for everyday use, providing soft and absorbent tissues.', 'groceries', 2.49, 86, 'Unknown', 'products/thumb_41_3ho1x8a.jpg', 2.69, 1, '2025-12-11 03:23:34.376886', '2025-12-23 08:30:20.964715', NULL, NULL),
(42, 'Water', 'Pure and refreshing bottled water, essential for staying hydrated throughout the day.', 'groceries', 0.99, 53, 'Unknown', 'products/thumb_42_TIuKeKb.jpg', 4.96, 1, '2025-12-11 03:23:36.406324', '2025-12-23 08:30:20.964715', NULL, NULL),
(43, 'Decoration Swing', 'The Decoration Swing is a charming addition to your home decor. Crafted with intricate details, it adds a touch of elegance and whimsy to any room.', 'home-decoration', 59.99, 47, 'Unknown', 'products/thumb_43_MAOg36g.jpg', 3.16, 1, '2025-12-11 03:23:37.362420', '2025-12-23 08:30:20.964715', NULL, NULL),
(44, 'Family Tree Photo Frame', 'The Family Tree Photo Frame is a sentimental and stylish way to display your cherished family memories. With multiple photo slots, it tells the story of your loved ones.', 'home-decoration', 29.99, 77, 'Unknown', 'products/thumb_44_C5i6Z6Q.jpg', 4.53, 1, '2025-12-11 03:23:41.318280', '2025-12-23 08:30:20.964715', NULL, NULL),
(45, 'House Showpiece Plant', 'The House Showpiece Plant is an artificial plant that brings a touch of nature to your home without the need for maintenance. It adds greenery and style to any space.', 'home-decoration', 39.99, 28, 'Unknown', 'products/thumb_45_3QjLdzp.jpg', 4.67, 1, '2025-12-11 03:23:42.516248', '2025-12-23 08:30:20.964715', NULL, NULL),
(46, 'Plant Pot', 'The Plant Pot is a stylish container for your favorite plants. With a sleek design, it complements your indoor or outdoor garden, adding a modern touch to your plant display.', 'home-decoration', 14.99, 59, 'Unknown', 'products/thumb_46_rDscyeQ.jpg', 3.01, 1, '2025-12-11 03:23:46.411316', '2025-12-23 08:30:20.964715', NULL, NULL),
(47, 'Table Lamp', 'The Table Lamp is a functional and decorative lighting solution for your living space. With a modern design, it provides both ambient and task lighting, enhancing the atmosphere.', 'home-decoration', 49.99, 9, 'Unknown', 'products/thumb_47_X0tcGEr.jpg', 3.55, 1, '2025-12-11 03:23:50.965384', '2025-12-23 08:30:20.964715', NULL, NULL),
(48, 'Bamboo Spatula', 'The Bamboo Spatula is a versatile kitchen tool made from eco-friendly bamboo. Ideal for flipping, stirring, and serving various dishes.', 'kitchen-accessories', 7.99, 37, 'Unknown', 'products/thumb_48_EmKHViy.jpg', 3.27, 1, '2025-12-11 03:23:52.147988', '2025-12-23 08:30:20.964715', NULL, NULL),
(49, 'Black Aluminium Cup', 'The Black Aluminium Cup is a stylish and durable cup suitable for both hot and cold beverages. Its sleek black design adds a modern touch to your drinkware collection.', 'kitchen-accessories', 5.99, 75, 'Unknown', 'products/thumb_49_o8AZKDI.jpg', 4.46, 1, '2025-12-11 03:23:53.124710', '2025-12-23 08:30:20.964715', NULL, NULL),
(50, 'Black Whisk', 'The Black Whisk is a kitchen essential for whisking and beating ingredients. Its ergonomic handle and sleek design make it a practical and stylish tool.', 'kitchen-accessories', 9.99, 73, 'Unknown', 'products/thumb_50_ANrcecN.jpg', 3.90, 1, '2025-12-11 03:23:55.165819', '2025-12-23 08:30:20.964715', NULL, NULL),
(51, 'Boxed Blender', 'The Boxed Blender is a powerful and compact blender perfect for smoothies, shakes, and more. Its convenient design and multiple functions make it a versatile kitchen appliance.', 'kitchen-accessories', 39.99, 9, 'Unknown', 'products/thumb_51_po6tA4p.jpg', 4.56, 1, '2025-12-11 03:23:56.368287', '2025-12-23 08:30:20.964715', NULL, NULL),
(52, 'Carbon Steel Wok', 'The Carbon Steel Wok is a versatile cooking pan suitable for stir-frying, sautéing, and deep frying. Its sturdy construction ensures even heat distribution for delicious meals.', 'kitchen-accessories', 29.99, 40, 'Unknown', 'products/thumb_52_5PWK3hL.jpg', 4.05, 1, '2025-12-11 03:23:59.826483', '2025-12-23 08:30:20.964715', NULL, NULL),
(53, 'Chopping Board', 'The Chopping Board is an essential kitchen accessory for food preparation. Made from durable material, it provides a safe and hygienic surface for cutting and chopping.', 'kitchen-accessories', 12.99, 14, 'Unknown', 'products/thumb_53_lu9HRMq.jpg', 3.70, 1, '2025-12-11 03:24:01.054938', '2025-12-23 08:30:20.964715', NULL, NULL),
(54, 'Citrus Squeezer Yellow', 'The Citrus Squeezer in Yellow is a handy tool for extracting juice from citrus fruits. Its vibrant color adds a cheerful touch to your kitchen gadgets.', 'kitchen-accessories', 8.99, 22, 'Unknown', 'products/thumb_54_M5sunTW.jpg', 4.63, 1, '2025-12-11 03:24:02.316724', '2025-12-23 08:30:20.964715', NULL, NULL),
(55, 'Egg Slicer', 'The Egg Slicer is a convenient tool for slicing boiled eggs evenly. It\'s perfect for salads, sandwiches, and other dishes where sliced eggs are desired.', 'kitchen-accessories', 6.99, 40, 'Unknown', 'products/thumb_55_g7uH6tZ.jpg', 3.09, 1, '2025-12-11 03:24:03.516124', '2025-12-23 08:30:20.964715', NULL, NULL),
(56, 'Electric Stove', 'The Electric Stove provides a portable and efficient cooking solution. Ideal for small kitchens or as an additional cooking surface for various culinary needs.', 'kitchen-accessories', 49.99, 21, 'Unknown', 'products/thumb_56_wbFX3uc.jpg', 4.11, 1, '2025-12-11 03:24:05.008326', '2025-12-23 08:30:20.964715', NULL, NULL),
(57, 'Fine Mesh Strainer', 'The Fine Mesh Strainer is a versatile tool for straining liquids and sifting dry ingredients. Its fine mesh ensures efficient filtering for smooth cooking and baking.', 'kitchen-accessories', 9.99, 85, 'Unknown', 'products/thumb_57_TiTy41X.jpg', 3.04, 1, '2025-12-11 03:24:08.032011', '2025-12-23 08:30:20.964715', NULL, NULL),
(58, 'Fork', 'The Fork is a classic utensil for various dining and serving purposes. Its durable and ergonomic design makes it a reliable choice for everyday use.', 'kitchen-accessories', 3.99, 7, 'Unknown', 'products/thumb_58_mpr35Om.jpg', 3.11, 1, '2025-12-11 03:24:09.527495', '2025-12-23 08:30:20.964715', NULL, NULL),
(59, 'Glass', 'The Glass is a versatile and elegant drinking vessel suitable for a variety of beverages. Its clear design allows you to enjoy the colors and textures of your drinks.', 'kitchen-accessories', 4.99, 46, 'Unknown', 'products/thumb_59_Uz1ISzx.jpg', 4.02, 1, '2025-12-11 03:24:10.502721', '2025-12-23 08:30:20.964715', NULL, NULL),
(60, 'Grater Black', 'The Grater in Black is a handy kitchen tool for grating cheese, vegetables, and more. Its sleek design and sharp blades make food preparation efficient and easy.', 'kitchen-accessories', 10.99, 84, 'Unknown', 'products/thumb_60_oRhaweN.jpg', 3.21, 1, '2025-12-11 03:24:12.221155', '2025-12-23 08:30:20.964715', NULL, NULL),
(61, 'Hand Blender', 'The Hand Blender is a versatile kitchen appliance for blending, pureeing, and mixing. Its compact design and powerful motor make it a convenient tool for various recipes.', 'kitchen-accessories', 34.99, 84, 'Unknown', 'products/thumb_61_yjA1IdI.jpg', 3.86, 1, '2025-12-11 03:24:13.727717', '2025-12-23 08:30:20.964715', NULL, NULL),
(62, 'Ice Cube Tray', 'The Ice Cube Tray is a practical accessory for making ice cubes in various shapes. Perfect for keeping your drinks cool and adding a fun element to your beverages.', 'kitchen-accessories', 5.99, 13, 'Unknown', 'products/thumb_62_CDiFVjs.jpg', 4.71, 1, '2025-12-11 03:24:14.955131', '2025-12-23 08:30:20.964715', NULL, NULL),
(63, 'Kitchen Sieve', 'The Kitchen Sieve is a versatile tool for sifting and straining dry and wet ingredients. Its fine mesh design ensures smooth results in your cooking and baking.', 'kitchen-accessories', 7.99, 68, 'Unknown', 'products/thumb_63_fNzuEJ1.jpg', 3.09, 1, '2025-12-11 03:24:16.166375', '2025-12-23 08:30:20.964715', NULL, NULL),
(64, 'Knife', 'The Knife is an essential kitchen tool for chopping, slicing, and dicing. Its sharp blade and ergonomic handle make it a reliable choice for food preparation.', 'kitchen-accessories', 14.99, 7, 'Unknown', 'products/thumb_64_GSbDBtc.jpg', 3.26, 1, '2025-12-11 03:24:17.592705', '2025-12-23 08:30:20.964715', NULL, NULL),
(65, 'Lunch Box', 'The Lunch Box is a convenient and portable container for packing and carrying your meals. With compartments for different foods, it\'s perfect for on-the-go dining.', 'kitchen-accessories', 12.99, 94, 'Unknown', 'products/thumb_65_uPb6jI4.jpg', 4.93, 1, '2025-12-11 03:24:18.615895', '2025-12-23 08:30:20.964715', NULL, NULL),
(66, 'Microwave Oven', 'The Microwave Oven is a versatile kitchen appliance for quick and efficient cooking, reheating, and defrosting. Its compact size makes it suitable for various kitchen setups.', 'kitchen-accessories', 89.99, 59, 'Unknown', 'products/thumb_66_Q1J0KN2.jpg', 4.82, 1, '2025-12-11 03:24:19.817798', '2025-12-23 08:30:20.964715', NULL, NULL),
(67, 'Mug Tree Stand', 'The Mug Tree Stand is a stylish and space-saving solution for organizing your mugs. Keep your favorite mugs easily accessible and neatly displayed in your kitchen.', 'kitchen-accessories', 15.99, 88, 'Unknown', 'products/thumb_67_lVNMSu3.jpg', 2.64, 1, '2025-12-11 03:24:23.646350', '2025-12-23 08:30:20.964715', NULL, NULL),
(68, 'Pan', 'The Pan is a versatile and essential cookware item for frying, sautéing, and cooking various dishes. Its non-stick coating ensures easy food release and cleanup.', 'kitchen-accessories', 24.99, 90, 'Unknown', 'products/thumb_68_tkQGrW6.jpg', 2.79, 1, '2025-12-11 03:24:25.477735', '2025-12-23 08:30:20.964715', NULL, NULL),
(69, 'Plate', 'The Plate is a classic and essential dishware item for serving meals. Its durable and stylish design makes it suitable for everyday use or special occasions.', 'kitchen-accessories', 3.99, 66, 'Unknown', 'products/thumb_69_TtZTR50.jpg', 3.65, 1, '2025-12-11 03:24:26.699491', '2025-12-23 08:30:20.964715', NULL, NULL),
(70, 'Red Tongs', 'The Red Tongs are versatile kitchen tongs suitable for various cooking and serving tasks. Their vibrant color adds a pop of excitement to your kitchen utensils.', 'kitchen-accessories', 6.99, 82, 'Unknown', 'products/thumb_70_nGZJSZA.jpg', 4.42, 1, '2025-12-11 03:24:27.926191', '2025-12-23 08:30:20.964715', NULL, NULL),
(71, 'Silver Pot With Glass Cap', 'The Silver Pot with Glass Cap is a stylish and functional cookware item for boiling, simmering, and preparing delicious meals. Its glass cap allows you to monitor cooking progress.', 'kitchen-accessories', 39.99, 40, 'Unknown', 'products/thumb_71_RIAPhXg.jpg', 3.22, 1, '2025-12-11 03:24:29.147974', '2025-12-23 08:30:20.964715', NULL, NULL),
(72, 'Slotted Turner', 'The Slotted Turner is a kitchen utensil designed for flipping and turning food items. Its slotted design allows excess liquid to drain, making it ideal for frying and sautéing.', 'kitchen-accessories', 8.99, 88, 'Unknown', 'products/thumb_72_uYfS2Hp.jpg', 3.40, 1, '2025-12-11 03:24:30.370221', '2025-12-23 08:30:20.964715', NULL, NULL),
(73, 'Spice Rack', 'The Spice Rack is a convenient organizer for your spices and seasonings. Keep your kitchen essentials within reach and neatly arranged with this stylish spice rack.', 'kitchen-accessories', 19.99, 79, 'Unknown', 'products/thumb_73_H6g6Tvm.jpg', 4.87, 1, '2025-12-11 03:24:32.093837', '2025-12-23 08:30:20.964715', NULL, NULL),
(74, 'Spoon', 'The Spoon is a versatile kitchen utensil for stirring, serving, and tasting. Its ergonomic design and durable construction make it an essential tool for every kitchen.', 'kitchen-accessories', 4.99, 59, 'Unknown', 'products/thumb_74_Fq3ctFy.jpg', 4.03, 1, '2025-12-11 03:24:33.288897', '2025-12-23 08:30:20.964715', NULL, NULL),
(75, 'Tray', 'The Tray is a functional and decorative item for serving snacks, appetizers, or drinks. Its stylish design makes it a versatile accessory for entertaining guests.', 'kitchen-accessories', 16.99, 71, 'Unknown', 'products/thumb_75_DJke2Jb.jpg', 4.62, 1, '2025-12-11 03:24:34.257316', '2025-12-23 08:30:20.964715', NULL, NULL),
(76, 'Wooden Rolling Pin', 'The Wooden Rolling Pin is a classic kitchen tool for rolling out dough for baking. Its smooth surface and sturdy handles make it easy to achieve uniform thickness.', 'kitchen-accessories', 11.99, 80, 'Unknown', 'products/thumb_76_DpSgfDN.jpg', 2.92, 1, '2025-12-11 03:24:35.470819', '2025-12-23 08:30:20.964715', NULL, NULL),
(77, 'Yellow Peeler', 'The Yellow Peeler is a handy tool for peeling fruits and vegetables with ease. Its bright yellow color adds a cheerful touch to your kitchen gadgets.', 'kitchen-accessories', 5.99, 35, 'Unknown', 'products/thumb_77_TUb2S1J.jpg', 4.24, 1, '2025-12-11 03:24:36.422130', '2025-12-23 08:30:20.964715', NULL, NULL),
(78, 'Apple MacBook Pro 14 Inch Space Grey', 'The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple\'s M1 Pro chip for exceptional performance and a stunning Retina display.', 'laptops', 1999.99, 24, 'Apple', 'products/thumb_78_HNnipGv.jpg', 3.65, 1, '2025-12-11 03:24:37.617305', '2025-12-23 08:30:20.964715', NULL, NULL),
(79, 'Asus Zenbook Pro Dual Screen Laptop', 'The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.', 'laptops', 1799.99, 45, 'Asus', 'products/thumb_79_4jVK9pE.jpg', 3.95, 1, '2025-12-11 03:24:40.262067', '2025-12-23 08:30:20.964715', NULL, NULL),
(80, 'Huawei Matebook X Pro', 'The Huawei Matebook X Pro is a slim and stylish laptop with a high-resolution touchscreen display, offering a premium experience for users on the go.', 'laptops', 1399.99, 75, 'Huawei', 'products/thumb_80_noT8AHG.jpg', 4.98, 1, '2025-12-11 03:24:43.178721', '2025-12-23 08:30:20.964715', NULL, NULL),
(81, 'Lenovo Yoga 920', 'The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge, allowing you to use it as a laptop or tablet, offering versatility and portability.', 'laptops', 1099.99, 40, 'Lenovo', 'products/thumb_81_AEHPJtG.jpg', 2.86, 1, '2025-12-11 03:24:46.064916', '2025-12-23 08:30:20.964715', NULL, NULL),
(82, 'New DELL XPS 13 9300 Laptop', 'The New DELL XPS 13 9300 Laptop is a compact and powerful device, featuring a virtually borderless InfinityEdge display and high-end performance for various tasks.', 'laptops', 1499.99, 74, 'Dell', 'products/thumb_82_jqqvUfB.jpg', 2.67, 1, '2025-12-11 03:24:49.014625', '2025-12-23 08:30:20.964715', NULL, NULL),
(83, 'Blue & Black Check Shirt', 'The Blue & Black Check Shirt is a stylish and comfortable men\'s shirt featuring a classic check pattern. Made from high-quality fabric, it\'s suitable for both casual and semi-formal occasions.', 'mens-shirts', 29.99, 38, 'Fashion Trends', 'products/thumb_83_I51AP6u.jpg', 3.64, 1, '2025-12-11 03:24:51.472628', '2025-12-23 08:30:20.964715', NULL, NULL),
(84, 'Gigabyte Aorus Men Tshirt', 'The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it\'s perfect for expressing your gaming style.', 'mens-shirts', 24.99, 90, 'Gigabyte', 'products/thumb_84_OTJyVQM.jpg', 3.18, 1, '2025-12-11 03:24:56.508625', '2025-12-23 08:30:20.964715', NULL, NULL),
(85, 'Man Plaid Shirt', 'The Man Plaid Shirt is a timeless and versatile men\'s shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.', 'mens-shirts', 34.99, 82, 'Classic Wear', 'products/thumb_85_uqBrpuW.jpg', 3.46, 1, '2025-12-11 03:25:00.004018', '2025-12-23 08:30:20.964715', NULL, NULL),
(86, 'Man Short Sleeve Shirt', 'The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it\'s perfect for a laid-back yet polished look.', 'mens-shirts', 19.99, 2, 'Casual Comfort', 'products/thumb_86_djDv5hB.jpg', 2.90, 1, '2025-12-11 03:25:04.487947', '2025-12-23 08:30:20.964715', NULL, NULL),
(87, 'Men Check Shirt', 'The Men Check Shirt is a classic and versatile shirt featuring a stylish check pattern. Suitable for various occasions, it adds a smart and polished touch to your wardrobe.', 'mens-shirts', 27.99, 95, 'Urban Chic', 'products/thumb_87_kLnauxZ.jpg', 2.72, 1, '2025-12-11 03:25:09.291290', '2025-12-23 08:30:20.964715', NULL, NULL),
(88, 'Nike Air Jordan 1 Red And Black', 'The Nike Air Jordan 1 in Red and Black is an iconic basketball sneaker known for its stylish design and high-performance features, making it a favorite among sneaker enthusiasts and athletes.', 'mens-shoes', 149.99, 7, 'Nike', 'products/thumb_88_YrrgZ0N.jpg', 4.77, 1, '2025-12-11 03:25:13.735928', '2025-12-23 08:30:20.964715', NULL, NULL),
(89, 'Nike Baseball Cleats', 'Nike Baseball Cleats are designed for maximum traction and performance on the baseball field. They provide stability and support for players during games and practices.', 'mens-shoes', 79.99, 12, 'Nike', 'products/thumb_89_yQynP4L.jpg', 3.88, 1, '2025-12-11 03:25:17.976956', '2025-12-23 08:30:20.964715', NULL, NULL),
(90, 'Puma Future Rider Trainers', 'The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.', 'mens-shoes', 89.99, 90, 'Puma', 'products/thumb_90_iXM0DLw.jpg', 4.90, 1, '2025-12-11 03:25:21.161170', '2025-12-23 08:30:20.964715', NULL, NULL),
(91, 'Sports Sneakers Off White & Red', 'The Sports Sneakers in Off White and Red combine style and functionality, making them a fashionable choice for sports enthusiasts. The red and off-white color combination adds a bold and energetic touch.', 'mens-shoes', 119.99, 17, 'Off White', 'products/thumb_91_AODqjM4.jpg', 4.77, 1, '2025-12-11 03:25:24.885156', '2025-12-23 08:30:20.964715', NULL, NULL),
(92, 'Sports Sneakers Off White Red', 'Another variant of the Sports Sneakers in Off White Red, featuring a unique design. These sneakers offer style and comfort for casual occasions.', 'mens-shoes', 109.99, 62, 'Off White', 'products/thumb_92_ff6yGWp.jpg', 4.69, 1, '2025-12-11 03:25:27.923146', '2025-12-23 08:30:20.964715', NULL, NULL),
(93, 'Brown Leather Belt Watch', 'The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.', 'mens-watches', 89.99, 32, 'Fashion Timepieces', 'products/thumb_93_OYs7TZh.jpg', 4.19, 1, '2025-12-11 03:25:32.035902', '2025-12-23 08:30:20.964715', NULL, NULL),
(94, 'Longines Master Collection', 'The Longines Master Collection is an elegant and refined watch known for its precision and craftsmanship. With a timeless design, it\'s a symbol of luxury and sophistication.', 'mens-watches', 1499.99, 100, 'Longines', 'products/thumb_94_X4g88KS.jpg', 3.87, 1, '2025-12-11 03:25:34.960240', '2025-12-23 08:30:20.964715', NULL, NULL),
(95, 'Rolex Cellini Date Black Dial', 'The Rolex Cellini Date with Black Dial is a classic and prestigious watch. With a black dial and date complication, it exudes sophistication and is a symbol of Rolex\'s heritage.', 'mens-watches', 8999.99, 40, 'Rolex', 'products/thumb_95_QKW6tzg.jpg', 4.97, 1, '2025-12-11 03:25:37.881289', '2025-12-23 08:30:20.964715', NULL, NULL),
(96, 'Rolex Cellini Moonphase', 'The Rolex Cellini Moonphase is a masterpiece of horology, featuring a moon phase complication and exquisite design. It reflects Rolex\'s commitment to precision and elegance.', 'mens-watches', 12999.99, 36, 'Rolex', 'products/thumb_96_bxendjO.jpg', 2.58, 1, '2025-12-11 03:25:40.846743', '2025-12-23 08:30:20.964715', NULL, NULL),
(97, 'Rolex Datejust', 'The Rolex Datejust is an iconic and versatile timepiece with a date window. Known for its timeless design and reliability, it\'s a symbol of Rolex\'s watchmaking excellence.', 'mens-watches', 10999.99, 86, 'Rolex', 'products/thumb_97_7xeojH8.jpg', 3.66, 1, '2025-12-11 03:25:43.493910', '2025-12-23 08:30:20.964715', NULL, NULL),
(98, 'Rolex Submariner Watch', 'The Rolex Submariner is a legendary dive watch with a rich history. Known for its durability and water resistance, it\'s a symbol of adventure and exploration.', 'mens-watches', 13999.99, 55, 'Rolex', 'products/thumb_98_g4P6P3J.jpg', 2.69, 1, '2025-12-11 03:25:45.704808', '2025-12-23 08:30:20.964715', NULL, NULL),
(99, 'Amazon Echo Plus', 'The Amazon Echo Plus is a smart speaker with built-in Alexa voice control. It features premium sound quality and serves as a hub for controlling smart home devices.', 'mobile-accessories', 99.99, 61, 'Amazon', 'products/thumb_99_3NwLAVW.jpg', 4.99, 1, '2025-12-11 03:25:48.588842', '2025-12-23 08:30:20.964715', NULL, NULL),
(100, 'Apple Airpods', 'The Apple Airpods offer a seamless wireless audio experience. With easy pairing, high-quality sound, and Siri integration, they are perfect for on-the-go listening.', 'mobile-accessories', 129.99, 67, 'Apple', 'products/thumb_100_9ciuf7e.jpg', 4.15, 1, '2025-12-11 03:25:51.623561', '2025-12-23 08:30:20.964715', NULL, NULL),
(101, 'Apple AirPods Max Silver', 'The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio, adaptive EQ, and active noise cancellation. Experience immersive sound in style.', 'mobile-accessories', 549.99, 59, 'Apple', 'products/thumb_101_fWtw68e.jpg', 3.47, 1, '2025-12-11 03:25:54.515977', '2025-12-23 08:30:20.964715', NULL, NULL),
(102, 'Apple Airpower Wireless Charger', 'The Apple AirPower Wireless Charger provides a convenient way to charge your compatible Apple devices wirelessly. Simply place your devices on the charging mat for effortless charging.', 'mobile-accessories', 79.99, 1, 'Apple', 'products/thumb_102_K3iVjKy.jpg', 3.68, 1, '2025-12-11 03:25:55.687492', '2025-12-23 08:30:20.964715', NULL, NULL),
(103, 'Apple HomePod Mini Cosmic Grey', 'The Apple HomePod Mini in Cosmic Grey is a compact smart speaker that delivers impressive audio and integrates seamlessly with the Apple ecosystem for a smart home experience.', 'mobile-accessories', 99.99, 27, 'Apple', 'products/thumb_103_Ml82J80.jpg', 4.62, 1, '2025-12-11 03:25:56.646120', '2025-12-23 08:30:20.964715', NULL, NULL),
(104, 'Apple iPhone Charger', 'The Apple iPhone Charger is a high-quality charger designed for fast and efficient charging of your iPhone. Ensure your device stays powered up and ready to go.', 'mobile-accessories', 19.99, 31, 'Apple', 'products/thumb_104_k5ahpDu.jpg', 4.15, 1, '2025-12-11 03:25:58.122162', '2025-12-23 08:30:20.964715', NULL, NULL),
(105, 'Apple MagSafe Battery Pack', 'The Apple MagSafe Battery Pack is a portable and convenient way to add extra battery life to your MagSafe-compatible iPhone. Attach it magnetically for a secure connection.', 'mobile-accessories', 99.99, 1, 'Apple', 'products/thumb_105_I2yuABJ.jpg', 3.62, 1, '2025-12-11 03:25:59.962474', '2025-12-23 08:30:20.964715', NULL, NULL),
(106, 'Apple Watch Series 4 Gold', 'The Apple Watch Series 4 in Gold is a stylish and advanced smartwatch with features like heart rate monitoring, fitness tracking, and a beautiful Retina display.', 'mobile-accessories', 349.99, 33, 'Apple', 'products/thumb_106_zlyufux.jpg', 2.74, 1, '2025-12-11 03:26:01.523709', '2025-12-23 08:30:20.964715', NULL, NULL),
(107, 'Beats Flex Wireless Earphones', 'The Beats Flex Wireless Earphones offer a comfortable and versatile audio experience. With magnetic earbuds and up to 12 hours of battery life, they are ideal for everyday use.', 'mobile-accessories', 49.99, 50, 'Beats', 'products/thumb_107_A6fMIJi.jpg', 4.24, 1, '2025-12-11 03:26:05.021330', '2025-12-23 08:30:20.964715', NULL, NULL),
(108, 'iPhone 12 Silicone Case with MagSafe Plum', 'The iPhone 12 Silicone Case with MagSafe in Plum is a stylish and protective case designed for the iPhone 12. It features MagSafe technology for easy attachment of accessories.', 'mobile-accessories', 29.99, 69, 'Apple', 'products/thumb_108_YWibn52.jpg', 3.62, 1, '2025-12-11 03:26:06.204014', '2025-12-23 08:30:20.964715', NULL, NULL),
(109, 'Monopod', 'The Monopod is a versatile camera accessory for stable and adjustable shooting. Perfect for capturing selfies, group photos, and videos with ease.', 'mobile-accessories', 19.99, 48, 'TechGear', 'products/thumb_109_x3UxdTl.jpg', 4.43, 1, '2025-12-11 03:26:09.256488', '2025-12-23 08:30:20.964715', NULL, NULL),
(110, 'Selfie Lamp with iPhone', 'The Selfie Lamp with iPhone is a portable and adjustable LED light designed to enhance your selfies and video calls. Attach it to your iPhone for well-lit photos.', 'mobile-accessories', 14.99, 58, 'GadgetMaster', 'products/thumb_110_lbSktW9.jpg', 3.55, 1, '2025-12-11 03:26:11.086410', '2025-12-23 08:30:20.964715', NULL, NULL),
(111, 'Selfie Stick Monopod', 'The Selfie Stick Monopod is a extendable and foldable device for capturing the perfect selfie or group photo. Compatible with smartphones and cameras.', 'mobile-accessories', 12.99, 10, 'SnapTech', 'products/thumb_111_g0vrb6R.jpg', 3.88, 1, '2025-12-11 03:26:12.046337', '2026-01-06 05:12:10.374345', NULL, NULL),
(112, 'TV Studio Camera Pedestal', 'The TV Studio Camera Pedestal is a professional-grade camera support system for smooth and precise camera movements in a studio setting. Ideal for broadcast and production.', 'mobile-accessories', 499.99, 15, 'ProVision', 'products/thumb_112_1sHpukI.jpg', 2.78, 1, '2025-12-11 03:26:13.544562', '2025-12-23 08:30:20.964715', NULL, NULL),
(113, 'Generic Motorcycle', 'The Generic Motorcycle is a versatile and reliable bike suitable for various riding preferences. With a balanced design, it provides a comfortable and efficient riding experience.', 'motorcycle', 3999.99, 34, 'Generic Motors', 'products/thumb_113_eZnDDln.jpg', 4.91, 1, '2025-12-11 03:26:14.765571', '2025-12-23 08:30:20.964715', NULL, NULL),
(114, 'Kawasaki Z800', 'The Kawasaki Z800 is a powerful and agile sportbike known for its striking design and performance. It\'s equipped with advanced features, making it a favorite among motorcycle enthusiasts.', 'motorcycle', 8999.99, 52, 'Kawasaki', 'products/thumb_114_32XcLIj.jpg', 3.98, 1, '2025-12-11 03:26:18.849625', '2025-12-23 08:30:20.964715', NULL, NULL),
(115, 'MotoGP CI.H1', 'The MotoGP CI.H1 is a high-performance motorcycle inspired by MotoGP racing technology. It offers cutting-edge features and precision engineering for an exhilarating riding experience.', 'motorcycle', 14999.99, 10, 'MotoGP', 'products/thumb_115_qpRtL4A.jpg', 2.97, 1, '2025-12-11 03:26:22.683252', '2025-12-23 08:30:20.964715', NULL, NULL),
(116, 'Scooter Motorcycle', 'The Scooter Motorcycle is a practical and fuel-efficient bike ideal for urban commuting. It features a step-through design and user-friendly controls for easy maneuverability.', 'motorcycle', 2999.99, 84, 'ScootMaster', 'products/thumb_116_gtQk3CS.jpg', 2.53, 1, '2025-12-11 03:26:26.506959', '2025-12-23 08:30:20.964715', NULL, NULL),
(117, 'Sportbike Motorcycle', 'The Sportbike Motorcycle is designed for speed and agility, with a sleek and aerodynamic profile. It\'s suitable for riders looking for a dynamic and thrilling riding experience.', 'motorcycle', 7499.99, 0, 'SpeedMaster', 'products/thumb_117_L4fjlDX.jpg', 3.94, 1, '2025-12-11 03:26:30.211141', '2025-12-23 08:30:20.964715', NULL, NULL),
(118, 'Attitude Super Leaves Hand Soap', 'Attitude Super Leaves Hand Soap is a natural and nourishing hand soap enriched with the goodness of super leaves. It cleanses and moisturizes your hands, leaving them feeling fresh and soft.', 'skin-care', 8.99, 94, 'Attitude', 'products/thumb_118_sqzoRq8.jpg', 3.19, 1, '2025-12-11 03:26:34.266435', '2025-12-23 08:30:20.964715', NULL, NULL),
(119, 'Olay Ultra Moisture Shea Butter Body Wash', 'Olay Ultra Moisture Shea Butter Body Wash is a luxurious body wash that hydrates and nourishes your skin with the moisturizing power of shea butter. Enjoy a rich lather and silky-smooth skin.', 'skin-care', 12.99, 34, 'Olay', 'products/thumb_119_vyRgfMr.jpg', 4.51, 1, '2025-12-11 03:26:37.247010', '2025-12-23 08:30:20.964715', NULL, NULL),
(120, 'Vaseline Men Body and Face Lotion', 'Vaseline Men Body and Face Lotion is a specially formulated lotion designed to provide long-lasting moisture to men\'s skin. It absorbs quickly and helps keep the skin hydrated and healthy.', 'skin-care', 9.99, 94, 'Vaseline', 'products/thumb_120_c6dvbMo.jpg', 3.16, 1, '2025-12-11 03:26:39.669880', '2026-01-05 08:13:10.051031', NULL, NULL),
(121, 'iPhone 5s', 'The iPhone 5s is a classic smartphone known for its compact design and advanced features during its release. While it\'s an older model, it still provides a reliable user experience.', 'smartphones', 199.99, 25, 'Apple', 'products/thumb_121_NYl7WJ2.jpg', 2.83, 1, '2025-12-11 03:26:42.638459', '2025-12-23 08:30:20.964715', NULL, NULL),
(122, 'iPhone 6', 'The iPhone 6 is a stylish and capable smartphone with a larger display and improved performance. It introduced new features and design elements, making it a popular choice in its time.', 'smartphones', 299.99, 60, 'Apple', 'products/thumb_122_buwpxkn.jpg', 3.41, 1, '2025-12-11 03:26:44.535106', '2025-12-23 08:30:20.964715', NULL, NULL),
(123, 'iPhone 13 Pro', 'The iPhone 13 Pro is a cutting-edge smartphone with a powerful camera system, high-performance chip, and stunning display. It offers advanced features for users who demand top-notch technology.', 'smartphones', 1099.99, 56, 'Apple', 'products/thumb_123_epho5UL.jpg', 4.12, 1, '2025-12-11 03:26:46.175218', '2025-12-23 08:30:20.964715', NULL, NULL),
(124, 'iPhone X', 'The iPhone X is a flagship smartphone featuring a bezel-less OLED display, facial recognition technology (Face ID), and impressive performance. It represents a milestone in iPhone design and innovation.', 'smartphones', 899.99, 37, 'Apple', 'products/thumb_124_jGx0bSV.jpg', 2.51, 1, '2025-12-11 03:26:48.264719', '2025-12-23 08:30:20.964715', NULL, NULL),
(125, 'Oppo A57', 'The Oppo A57 is a mid-range smartphone known for its sleek design and capable features. It offers a balance of performance and affordability, making it a popular choice.', 'smartphones', 249.99, 19, 'Oppo', 'products/thumb_125_i8zNXLA.jpg', 3.94, 1, '2025-12-11 03:26:50.407683', '2025-12-23 08:30:20.964715', NULL, NULL),
(126, 'Oppo F19 Pro Plus', 'The Oppo F19 Pro Plus is a feature-rich smartphone with a focus on camera capabilities. It boasts advanced photography features and a powerful performance for a premium user experience.', 'smartphones', 399.99, 78, 'Oppo', 'products/thumb_126_ZeR5FOb.jpg', 3.51, 1, '2025-12-11 03:26:52.322092', '2025-12-23 08:30:20.964715', NULL, NULL),
(127, 'Oppo K1', 'The Oppo K1 series offers a range of smartphones with various features and specifications. Known for their stylish design and reliable performance, the Oppo K1 series caters to diverse user preferences.', 'smartphones', 299.99, 55, 'Oppo', 'products/thumb_127_4LEQkOa.jpg', 4.25, 1, '2025-12-11 03:26:54.742535', '2025-12-23 08:30:20.964715', NULL, NULL),
(128, 'Realme C35', 'The Realme C35 is a budget-friendly smartphone with a focus on providing essential features for everyday use. It offers a reliable performance and user-friendly experience.', 'smartphones', 149.99, 48, 'Realme', 'products/thumb_128_ehMFtzf.jpg', 4.20, 1, '2025-12-11 03:26:58.405136', '2025-12-23 08:30:20.964715', NULL, NULL),
(129, 'Realme X', 'The Realme X is a mid-range smartphone known for its sleek design and impressive display. It offers a good balance of performance and camera capabilities for users seeking a quality device.', 'smartphones', 299.99, 12, 'Realme', 'products/thumb_129_RzmkFlV.jpg', 3.70, 1, '2025-12-11 03:27:00.810906', '2025-12-23 08:30:20.964715', NULL, NULL),
(130, 'Realme XT', 'The Realme XT is a feature-rich smartphone with a focus on camera technology. It comes equipped with advanced camera sensors, delivering high-quality photos and videos for photography enthusiasts.', 'smartphones', 349.99, 80, 'Realme', 'products/thumb_130_VLbmBzP.jpg', 4.58, 1, '2025-12-11 03:27:03.170629', '2025-12-23 08:30:20.964715', NULL, NULL),
(131, 'Samsung Galaxy S7', 'The Samsung Galaxy S7 is a flagship smartphone known for its sleek design and advanced features. It features a high-resolution display, powerful camera, and robust performance.', 'smartphones', 299.99, 67, 'Samsung', 'products/thumb_131_Im3eLSP.jpg', 3.30, 1, '2025-12-11 03:27:05.823033', '2025-12-23 08:30:20.964715', NULL, NULL),
(132, 'Samsung Galaxy S8', 'The Samsung Galaxy S8 is a premium smartphone with an Infinity Display, offering a stunning visual experience. It boasts advanced camera capabilities and cutting-edge technology.', 'smartphones', 499.99, 0, 'Samsung', 'products/thumb_132_xq5C5Rc.jpg', 4.40, 1, '2025-12-11 03:27:07.914047', '2025-12-23 08:30:20.964715', NULL, NULL),
(133, 'Samsung Galaxy S10', 'The Samsung Galaxy S10 is a flagship device featuring a dynamic AMOLED display, versatile camera system, and powerful performance. It represents innovation and excellence in smartphone technology.', 'smartphones', 699.99, 19, 'Samsung', 'products/thumb_133_7S4a1vR.jpg', 3.06, 1, '2025-12-11 03:27:09.810691', '2025-12-23 08:30:20.964715', NULL, NULL),
(134, 'Vivo S1', 'The Vivo S1 is a stylish and mid-range smartphone offering a blend of design and performance. It features a vibrant display, capable camera system, and reliable functionality.', 'smartphones', 249.99, 50, 'Vivo', 'products/thumb_134_D4Zwk3U.jpg', 3.50, 1, '2025-12-11 03:27:11.966238', '2025-12-23 08:30:20.964715', NULL, NULL),
(135, 'Vivo V9', 'The Vivo V9 is a smartphone known for its sleek design and emphasis on capturing high-quality selfies. It features a notch display, dual-camera setup, and a modern design.', 'smartphones', 299.99, 81, 'Vivo', 'products/thumb_135_BbH9Rmi.jpg', 3.60, 1, '2025-12-11 03:27:14.108779', '2026-01-06 07:12:07.621867', NULL, NULL),
(136, 'Vivo X21', 'The Vivo X21 is a premium smartphone with a focus on cutting-edge technology. It features an in-display fingerprint sensor, a high-resolution display, and advanced camera capabilities.', 'smartphones', 499.99, 5, 'Vivo', 'products/thumb_136_oFFGFiQ.jpg', 5.00, 1, '2025-12-11 03:27:16.492311', '2026-01-06 07:12:07.617666', NULL, NULL),
(137, 'American Football', 'The American Football is a classic ball used in American football games. It is designed for throwing and catching, making it an essential piece of equipment for the sport.', 'sports-accessories', 19.99, 53, 'Unknown', 'products/thumb_137_2MyrzJL.jpg', 4.91, 1, '2025-12-11 03:27:18.625073', '2025-12-23 08:30:20.964715', NULL, NULL),
(138, 'Baseball Ball', 'The Baseball Ball is a standard baseball used in baseball games. It features a durable leather cover and is designed for pitching, hitting, and fielding in the game of baseball.', 'sports-accessories', 8.99, 100, 'Unknown', 'products/thumb_138_au1SfKo.jpg', 2.57, 1, '2025-12-11 03:27:20.084822', '2025-12-23 08:30:20.964715', NULL, NULL),
(139, 'Baseball Glove', 'The Baseball Glove is a protective glove worn by baseball players. It is designed to catch and field the baseball, providing players with comfort and control during the game.', 'sports-accessories', 24.99, 21, 'Unknown', 'products/thumb_139_0SaFZrH.jpg', 3.96, 1, '2025-12-11 03:27:21.064081', '2026-01-05 07:45:05.601733', NULL, NULL),
(140, 'Basketball', 'The Basketball is a standard ball used in basketball games. It is designed for dribbling, shooting, and passing in the game of basketball, suitable for both indoor and outdoor play.', 'sports-accessories', 14.99, 75, 'Unknown', 'products/thumb_140_ZMh3w77.jpg', 4.66, 1, '2025-12-11 03:27:23.750703', '2025-12-23 08:30:20.964715', NULL, NULL),
(141, 'Basketball Rim', 'The Basketball Rim is a sturdy hoop and net assembly mounted on a basketball backboard. It provides a target for shooting and scoring in the game of basketball.', 'sports-accessories', 39.99, 43, 'Unknown', 'products/thumb_141_9d5MUiT.jpg', 4.60, 1, '2025-12-11 03:27:25.406556', '2025-12-23 08:30:20.964715', NULL, NULL),
(142, 'Cricket Ball', 'The Cricket Ball is a hard leather ball used in the sport of cricket. It is bowled and batted in the game, and its hardness and seam contribute to the dynamics of cricket play.', 'sports-accessories', 12.99, 30, 'Unknown', 'products/thumb_142_pt9l8NY.jpg', 3.53, 1, '2025-12-11 03:27:27.253468', '2025-12-23 08:30:20.964715', NULL, NULL),
(143, 'Cricket Bat', 'The Cricket Bat is an essential piece of cricket equipment used by batsmen to hit the cricket ball. It is made of wood and comes in various sizes and designs.', 'sports-accessories', 29.99, 98, 'Unknown', 'products/thumb_143_sElCyxe.jpg', 3.17, 1, '2025-12-11 03:27:28.895604', '2025-12-23 08:30:20.964715', NULL, NULL),
(144, 'Cricket Helmet', 'The Cricket Helmet is a protective headgear worn by cricket players, especially batsmen and wicketkeepers. It provides protection against fast bowling and bouncers.', 'sports-accessories', 44.99, 10, 'Unknown', 'products/thumb_144_YHgmE3j.jpg', 4.69, 1, '2025-12-11 03:27:30.536336', '2025-12-23 08:30:20.964715', NULL, NULL),
(145, 'Cricket Wicket', 'The Cricket Wicket is a set of three stumps and two bails, forming a wicket used in the sport of cricket. Batsmen aim to protect the wicket while scoring runs.', 'sports-accessories', 29.99, 25, 'Unknown', 'products/thumb_145_lncHFW8.jpg', 4.73, 1, '2025-12-11 03:27:35.502952', '2025-12-23 08:30:20.964715', NULL, NULL),
(146, 'Feather Shuttlecock', 'The Feather Shuttlecock is used in the sport of badminton. It features natural feathers and is designed for high-speed play, providing stability and accuracy during matches.', 'sports-accessories', 5.99, 94, 'Unknown', 'products/thumb_146_hoHhcnM.jpg', 2.85, 1, '2025-12-11 03:27:37.263818', '2026-01-05 03:13:47.583746', NULL, NULL),
(147, 'Football', 'The Football, also known as a soccer ball, is the standard ball used in the sport of football (soccer). It is designed for kicking and passing in the game.', 'sports-accessories', 17.99, 96, 'Unknown', 'products/thumb_147_utZvc5O.jpg', 3.28, 1, '2025-12-11 03:27:38.946055', '2025-12-23 08:30:20.964715', NULL, NULL),
(148, 'Golf Ball', 'The Golf Ball is a small ball used in the sport of golf. It features dimples on its surface, providing aerodynamic lift and distance when struck by a golf club.', 'sports-accessories', 9.99, 83, 'Unknown', 'products/thumb_148_Gyqsz3m.jpg', 4.30, 1, '2025-12-11 03:27:39.919637', '2026-01-05 04:04:50.652118', NULL, NULL),
(149, 'Iron Golf', 'The Iron Golf is a type of golf club designed for various golf shots. It features a solid metal head and is used for approach shots, chipping, and other golfing techniques.', 'sports-accessories', 49.99, 90, 'Unknown', 'products/thumb_149_SjrGYna.jpg', 4.41, 1, '2025-12-11 03:27:41.618287', '2025-12-23 08:30:20.964715', NULL, NULL);
INSERT INTO `products` (`id`, `title`, `description`, `category`, `price`, `stock`, `brand`, `thumbnail`, `rating`, `is_active`, `created_at`, `updated_at`, `seller_id`, `original_price`) VALUES
(150, 'Metal Baseball Bat', 'The Metal Baseball Bat is a durable and lightweight baseball bat made from metal alloys. It is commonly used in baseball games for hitting and batting practice.', 'sports-accessories', 29.99, 16, 'Unknown', 'products/thumb_150_jkjjkyV.jpg', 4.66, 1, '2025-12-11 03:27:42.125026', '2025-12-23 08:30:20.964715', NULL, NULL),
(151, 'Tennis Ball', 'The Tennis Ball is a standard ball used in the sport of tennis. It is designed for bouncing and hitting with tennis rackets during matches or practice sessions.', 'sports-accessories', 6.99, 28, 'Unknown', 'products/thumb_151_kObWPIE.jpg', 4.06, 1, '2025-12-11 03:27:43.533143', '2025-12-23 08:30:20.964715', NULL, NULL),
(152, 'Tennis Racket', 'The Tennis Racket is an essential piece of equipment used in the sport of tennis. It features a frame with strings and a grip, allowing players to hit the tennis ball.', 'sports-accessories', 49.99, 5, 'Unknown', 'products/thumb_152_slVShsR.jpg', 4.03, 1, '2025-12-11 03:27:45.142136', '2026-01-05 03:05:32.220051', NULL, NULL),
(153, 'Volleyball', 'The Volleyball is a standard ball used in the sport of volleyball. It is designed for passing, setting, and spiking over the net during volleyball matches.', 'sports-accessories', 11.99, 0, 'Unknown', 'products/thumb_153_m66O77q.jpg', 3.84, 1, '2025-12-11 03:27:47.013286', '2025-12-23 08:30:20.964715', NULL, NULL),
(154, 'Black Sun Glasses', 'The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.', 'sunglasses', 29.99, 60, 'Fashion Shades', 'products/thumb_154_xMLSEr6.jpg', 4.41, 1, '2025-12-11 03:27:47.514927', '2025-12-23 08:30:20.964715', NULL, NULL),
(155, 'Classic Sun Glasses', 'The Classic Sun Glasses offer a timeless design with a neutral frame and UV-protected lenses. These sunglasses are versatile and suitable for various occasions.', 'sunglasses', 24.99, 0, 'Fashion Shades', 'products/thumb_155_By7MaB1.jpg', 3.86, 1, '2025-12-11 03:27:51.485325', '2026-01-05 03:21:32.241725', NULL, NULL),
(156, 'Green and Black Glasses', 'The Green and Black Glasses feature a bold combination of green and black colors, adding a touch of vibrancy to your eyewear collection. They are both stylish and eye-catching.', 'sunglasses', 34.99, 24, 'Fashion Shades', 'products/thumb_156_tL9vC6L.jpg', 4.55, 1, '2025-12-11 03:27:53.734353', '2025-12-23 08:30:20.964715', NULL, NULL),
(157, 'Party Glasses', 'The Party Glasses are designed to add flair to your party outfit. With unique shapes or colorful frames, they\'re perfect for adding a playful touch to your look during celebrations.', 'sunglasses', 19.99, 86, 'Fashion Fun', 'products/thumb_157_IuA22aK.jpg', 2.79, 1, '2025-12-11 03:27:56.705076', '2025-12-23 08:30:20.964715', NULL, NULL),
(158, 'Sunglasses', 'The Sunglasses offer a classic and simple design with a focus on functionality. These sunglasses provide essential UV protection while maintaining a timeless look.', 'sunglasses', 22.99, 27, 'Fashion Shades', 'products/thumb_158_rFO0z8Q.jpg', 3.02, 1, '2025-12-11 03:28:01.092611', '2025-12-23 08:30:20.964715', NULL, NULL),
(159, 'iPad Mini 2021 Starlight', 'The iPad Mini 2021 in Starlight is a compact and powerful tablet from Apple. Featuring a stunning Retina display, powerful A-series chip, and a sleek design, it offers a premium tablet experience.', 'tablets', 499.99, 47, 'Apple', 'products/thumb_159_7EutGy9.jpg', 3.18, 1, '2025-12-11 03:28:07.017090', '2025-12-23 08:30:20.964715', NULL, NULL),
(160, 'Samsung Galaxy Tab S8 Plus Grey', 'The Samsung Galaxy Tab S8 Plus in Grey is a high-performance Android tablet by Samsung. With a large AMOLED display, powerful processor, and S Pen support, it\'s ideal for productivity and entertainment.', 'tablets', 599.99, 61, 'Samsung', 'products/thumb_160_WQNkNEw.jpg', 4.68, 1, '2025-12-11 03:28:13.933880', '2026-01-05 03:03:21.319562', NULL, NULL),
(161, 'Samsung Galaxy Tab White', 'The Samsung Galaxy Tab in White is a sleek and versatile Android tablet. With a vibrant display, long-lasting battery, and a range of features, it offers a great user experience for various tasks.', 'tablets', 349.99, 91, 'Samsung', 'products/thumb_161_H8HAZho.jpg', 3.72, 1, '2025-12-11 03:28:17.324350', '2025-12-23 08:30:20.964715', NULL, NULL),
(162, 'Blue Frock', 'The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.', 'tops', 29.99, 52, 'Unknown', 'products/thumb_162_TtPFm7i.jpg', 4.17, 1, '2025-12-11 03:28:20.406984', '2025-12-23 08:30:20.964715', NULL, NULL),
(163, 'Girl Summer Dress', 'The Girl Summer Dress is a cute and breezy dress designed for warm weather. With playful patterns and lightweight fabric, it\'s perfect for keeping cool and stylish during the summer.', 'tops', 19.99, 43, 'Unknown', 'products/thumb_163_hhhXCAz.jpg', 4.77, 1, '2025-12-11 03:28:23.927716', '2025-12-23 08:30:20.964715', NULL, NULL),
(164, 'Gray Dress', 'The Gray Dress is a versatile and chic option for various occasions. With a neutral gray color, it can be dressed up or down, making it a wardrobe staple for any fashion-forward individual.', 'tops', 34.99, 55, 'Unknown', 'products/thumb_164_c53mvcF.jpg', 2.72, 1, '2025-12-11 03:28:27.542798', '2025-12-23 08:30:20.964715', NULL, NULL),
(165, 'Short Frock', 'The Short Frock is a playful and trendy dress with a shorter length. Ideal for casual outings or special occasions, it combines style and comfort for a fashionable look.', 'tops', 24.99, 22, 'Unknown', 'products/thumb_165_B4N1gPG.jpg', 3.23, 1, '2025-12-11 03:28:31.105030', '2025-12-23 08:30:20.964715', NULL, NULL),
(166, 'Tartan Dress', 'The Tartan Dress features a classic tartan pattern, bringing a timeless and sophisticated touch to your wardrobe. Perfect for fall and winter, it adds a hint of traditional charm.', 'tops', 39.99, 73, 'Unknown', 'products/thumb_166_MzXCQH1.jpg', 4.05, 1, '2025-12-11 03:28:35.737732', '2025-12-23 08:30:20.964715', NULL, NULL),
(167, '300 Touring', 'The 300 Touring is a stylish and comfortable sedan, known for its luxurious features and smooth performance.', 'vehicle', 28999.99, 53, 'Chrysler', 'products/thumb_167_XA4Mhu1.jpg', 4.05, 1, '2025-12-11 03:28:40.469420', '2026-01-05 02:41:52.847180', NULL, NULL),
(168, 'Charger SXT RWD', 'The Charger SXT RWD is a powerful and sporty rear-wheel-drive sedan, offering a blend of performance and practicality.', 'vehicle', 32999.99, 56, 'Dodge', 'products/thumb_168_YSeDe4G.jpg', 2.58, 1, '2025-12-11 03:28:45.134218', '2025-12-23 08:30:20.964715', NULL, NULL),
(169, 'Dodge Hornet GT Plus', 'The Dodge Hornet GT Plus is a compact and agile hatchback, perfect for urban driving with a touch of sportiness.', 'vehicle', 24999.99, 82, 'Dodge', 'products/thumb_169_f1aDkQO.jpg', 2.65, 1, '2025-12-11 03:28:51.103624', '2025-12-23 08:30:20.964715', NULL, NULL),
(170, 'Durango SXT RWD', 'The Durango SXT RWD is a spacious and versatile SUV, known for its strong performance and family-friendly features.', 'vehicle', 36999.99, 95, 'Dodge', 'products/thumb_170_wPfjnCW.jpg', 4.07, 1, '2025-12-11 03:28:56.399902', '2025-12-23 08:30:20.964715', NULL, NULL),
(171, 'Pacifica Touring', 'The Pacifica Touring is a stylish and well-equipped minivan, offering comfort and convenience for family journeys.', 'vehicle', 31999.99, 53, 'Chrysler', 'products/thumb_171_TLn8lK2.jpg', 3.62, 1, '2025-12-11 03:29:00.855953', '2025-12-23 08:30:20.964715', NULL, NULL),
(172, 'Blue Women\'s Handbag', 'The Blue Women\'s Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.', 'womens-bags', 49.99, 76, 'Fashionista', 'products/thumb_172_yVn7pPK.jpg', 2.92, 1, '2025-12-11 03:29:06.430590', '2025-12-23 08:30:20.964715', NULL, NULL),
(173, 'Heshe Women\'s Leather Bag', 'The Heshe Women\'s Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it\'s a versatile accessory.', 'womens-bags', 129.99, 99, 'Heshe', 'products/thumb_173_Zi8Zvd0.jpg', 4.92, 1, '2025-12-11 03:29:09.327421', '2025-12-23 08:30:20.964715', NULL, NULL),
(174, 'Prada Women Bag', 'The Prada Women Bag is an iconic designer bag that exudes elegance and luxury. Crafted with precision and featuring the Prada logo, it\'s a statement piece for fashion enthusiasts.', 'womens-bags', 599.99, 75, 'Prada', 'products/thumb_174_jXOtS7J.jpg', 2.71, 1, '2025-12-11 03:29:14.525355', '2025-12-23 08:30:20.964715', NULL, NULL),
(175, 'White Faux Leather Backpack', 'The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it\'s perfect for both casual and on-the-go styles.', 'womens-bags', 39.99, 39, 'Urban Chic', 'products/thumb_175_eaj5lfx.jpg', 3.36, 1, '2025-12-11 03:29:17.831057', '2025-12-23 08:30:20.964715', NULL, NULL),
(176, 'Women Handbag Black', 'The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it\'s a must-have in every woman\'s wardrobe.', 'womens-bags', 59.99, 10, 'Elegance Collection', 'products/thumb_176_mF6XLbA.jpg', 2.89, 1, '2025-12-11 03:29:19.970742', '2025-12-23 08:30:20.964715', NULL, NULL),
(177, 'Black Women\'s Gown', 'The Black Women\'s Gown is an elegant and timeless evening gown. With a sleek black design, it\'s perfect for formal events and special occasions, exuding sophistication and style.', 'womens-dresses', 129.99, 25, 'Unknown', 'products/thumb_177_qVnR5HC.jpg', 3.64, 1, '2025-12-11 03:29:23.496637', '2025-12-23 08:30:20.964715', NULL, NULL),
(178, 'Corset Leather With Skirt', 'The Corset Leather With Skirt is a bold and edgy ensemble that combines a stylish corset with a matching skirt. Ideal for fashion-forward individuals, it makes a statement at any event.', 'womens-dresses', 89.99, 30, 'Unknown', 'products/thumb_178_ggxQbsL.jpg', 3.05, 1, '2025-12-11 03:29:27.178072', '2025-12-23 08:30:20.964715', NULL, NULL),
(179, 'Corset With Black Skirt', 'The Corset With Black Skirt is a chic and versatile outfit that pairs a fashionable corset with a classic black skirt. It offers a trendy and coordinated look for various occasions.', 'womens-dresses', 79.99, 33, 'Unknown', 'products/thumb_179_2m8ntR2.jpg', 4.52, 1, '2025-12-11 03:29:31.710687', '2025-12-23 08:30:20.964715', NULL, NULL),
(180, 'Dress Pea', 'The Dress Pea is a stylish and comfortable dress with a pea pattern. Perfect for casual outings, it adds a playful and fun element to your wardrobe, making it a great choice for day-to-day wear.', 'womens-dresses', 49.99, 6, 'Unknown', 'products/thumb_180_MfVbkeg.jpg', 4.88, 1, '2025-12-11 03:29:34.047041', '2025-12-23 08:30:20.964715', NULL, NULL),
(181, 'Marni Red & Black Suit', 'The Marni Red & Black Suit is a sophisticated and fashion-forward suit ensemble. With a combination of red and black tones, it showcases a modern design for a bold and confident look.', 'womens-dresses', 179.99, 61, 'Unknown', 'products/thumb_181_V4OcXV9.jpg', 4.48, 1, '2025-12-11 03:29:38.700981', '2025-12-23 08:30:20.964715', NULL, NULL),
(182, 'Green Crystal Earring', 'The Green Crystal Earring is a dazzling accessory that features a vibrant green crystal. With a classic design, it adds a touch of elegance to your ensemble, perfect for formal or special occasions.', 'womens-jewellery', 29.99, 53, 'Unknown', 'products/thumb_182_ra1DwIs.jpg', 3.96, 1, '2025-12-11 03:29:43.268859', '2025-12-23 08:30:20.964715', NULL, NULL),
(183, 'Green Oval Earring', 'The Green Oval Earring is a stylish and versatile accessory with a unique oval shape. Whether for casual or dressy occasions, its green hue and contemporary design make it a standout piece.', 'womens-jewellery', 24.99, 73, 'Unknown', 'products/thumb_183_WYjeZF7.jpg', 3.57, 1, '2025-12-11 03:29:45.154106', '2025-12-23 08:30:20.964715', NULL, NULL),
(184, 'Tropical Earring', 'The Tropical Earring is a fun and playful accessory inspired by tropical elements. Featuring vibrant colors and a lively design, it\'s perfect for adding a touch of summer to your look.', 'womens-jewellery', 19.99, 1, 'Unknown', 'products/thumb_184_U3yv4Fr.jpg', 4.40, 1, '2025-12-11 03:29:48.790352', '2025-12-23 08:30:20.964715', NULL, NULL),
(185, 'Black & Brown Slipper', 'The Black & Brown Slipper is a comfortable and stylish choice for casual wear. Featuring a blend of black and brown colors, it adds a touch of sophistication to your relaxation.', 'womens-shoes', 19.99, 2, 'Comfort Trends', 'products/thumb_185_TUE3lNb.jpg', 2.53, 1, '2025-12-11 03:29:53.080669', '2025-12-23 08:30:20.964715', NULL, NULL),
(186, 'Calvin Klein Heel Shoes', 'Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.', 'womens-shoes', 79.99, 89, 'Calvin Klein', 'products/thumb_186_45MctNR.jpg', 4.92, 1, '2025-12-11 03:29:55.619172', '2026-01-05 04:18:28.337561', NULL, NULL),
(187, 'Golden Shoes Woman', 'The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.', 'womens-shoes', 49.99, 88, 'Fashion Diva', 'products/thumb_187_CSnwiU5.jpg', 3.26, 1, '2025-12-11 03:30:02.261763', '2025-12-23 08:30:20.964715', NULL, NULL),
(188, 'Pampi Shoes', 'Pampi Shoes offer a blend of comfort and style for everyday use. With a versatile design, they are suitable for various casual occasions, providing a trendy and relaxed look.', 'womens-shoes', 29.99, 49, 'Pampi', 'products/thumb_188_8X5LZPq.jpg', 3.05, 1, '2025-12-11 03:30:06.528685', '2025-12-23 08:30:20.964715', NULL, NULL),
(189, 'Red Shoes', 'The Red Shoes make a bold statement with their vibrant red color. Whether for a party or a casual outing, these shoes add a pop of color and style to your wardrobe.', 'womens-shoes', 34.99, 6, 'Fashion Express', 'products/thumb_189_FD6E6H0.jpg', 3.25, 1, '2025-12-11 03:30:11.055977', '2025-12-23 08:30:20.964715', NULL, NULL),
(190, 'IWC Ingenieur Automatic Steel', 'The IWC Ingenieur Automatic Steel watch is a durable and sophisticated timepiece. With a stainless steel case and automatic movement, it combines precision and style for watch enthusiasts.', 'womens-watches', 4999.99, 90, 'IWC', 'products/thumb_190_M7gB2YV.jpg', 2.93, 1, '2025-12-11 03:30:16.203968', '2025-12-23 08:30:20.964715', NULL, NULL),
(191, 'Rolex Cellini Moonphase', 'The Rolex Cellini Moonphase watch is a masterpiece of horology. Featuring a moon phase complication, it showcases the craftsmanship and elegance that Rolex is renowned for.', 'womens-watches', 15999.99, 47, 'Rolex', 'products/thumb_191_NSlTusx.jpg', 3.83, 1, '2025-12-11 03:30:18.458329', '2026-01-05 03:35:45.575687', NULL, NULL),
(192, 'Rolex Datejust Women', 'The Rolex Datejust Women\'s watch is an iconic timepiece designed for women. With a timeless design and a date complication, it offers both elegance and functionality.', 'womens-watches', 10999.99, 26, 'Rolex', 'products/thumb_192_ahZ8bv0.jpg', 2.86, 1, '2025-12-11 03:30:22.404300', '2026-01-06 09:31:20.743391', NULL, NULL),
(193, 'Watch Gold for Women', '', 'womens-watches', 799.00, 0, 'Fashion Gold', 'products/thumb_193_8rccSlX.jpg', 4.24, 1, '2025-12-11 03:30:25.491168', '2026-01-05 09:47:33.196536', NULL, NULL),
(194, 'Women\'s Wrist Watch', '', 'womens-watches', 130.00, 40, 'Fashion Co.', 'products/thumb_194_2qjasaO.jpg', 4.00, 1, '2025-12-11 03:30:27.751801', '2026-01-06 09:57:09.809147', NULL, NULL),
(195, 'IPHONE 17', '', 'smartphones', 35000.00, 25, '', 'products/GSMN-APL-17PM256BLTU_7_251020_220200_3utxPUM.webp', 5.00, 1, '2025-12-23 09:32:01.141166', '2026-01-06 09:39:30.534934', NULL, NULL),
(203, 'Test Product Flow', 'For testing', 'Test', 100.00, 9, '', '', 0.00, 0, '2026-01-06 09:26:59.294942', '2026-01-06 09:33:10.413482', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint NOT NULL,
  `image_url` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `image_url`, `created_at`, `product_id`) VALUES
(1, 'products/gallery/gallery_1_0.jpg', '2025-12-23 09:38:12.918341', 1),
(2, 'products/gallery/gallery_2_0.jpg', '2025-12-23 09:38:12.918341', 2),
(3, 'products/gallery/gallery_3_0.jpg', '2025-12-23 09:38:12.918341', 3),
(4, 'products/gallery/gallery_4_0.jpg', '2025-12-23 09:38:12.918341', 4),
(5, 'products/gallery/gallery_5_0.jpg', '2025-12-23 09:38:12.918341', 5),
(6, 'products/gallery/gallery_6_0.jpg', '2025-12-23 09:38:12.918341', 6),
(7, 'products/gallery/gallery_6_1.jpg', '2025-12-23 09:38:12.918341', 6),
(8, 'products/gallery/gallery_6_2.jpg', '2025-12-23 09:38:12.918341', 6),
(9, 'products/gallery/gallery_7_0.jpg', '2025-12-23 09:38:12.918341', 7),
(10, 'products/gallery/gallery_7_1.jpg', '2025-12-23 09:38:12.918341', 7),
(11, 'products/gallery/gallery_7_2.jpg', '2025-12-23 09:38:12.918341', 7),
(12, 'products/gallery/gallery_8_0.jpg', '2025-12-23 09:38:12.918341', 8),
(13, 'products/gallery/gallery_8_1.jpg', '2025-12-23 09:38:12.918341', 8),
(14, 'products/gallery/gallery_8_2.jpg', '2025-12-23 09:38:12.918341', 8),
(15, 'products/gallery/gallery_9_0.jpg', '2025-12-23 09:38:12.918341', 9),
(16, 'products/gallery/gallery_9_1.jpg', '2025-12-23 09:38:12.918341', 9),
(17, 'products/gallery/gallery_9_2.jpg', '2025-12-23 09:38:12.918341', 9),
(18, 'products/gallery/gallery_10_0.jpg', '2025-12-23 09:38:12.918341', 10),
(19, 'products/gallery/gallery_10_1.jpg', '2025-12-23 09:38:12.918341', 10),
(20, 'products/gallery/gallery_10_2.jpg', '2025-12-23 09:38:12.918341', 10),
(21, 'products/gallery/gallery_11_0.jpg', '2025-12-23 09:38:12.918341', 11),
(22, 'products/gallery/gallery_11_1.jpg', '2025-12-23 09:38:12.918341', 11),
(23, 'products/gallery/gallery_11_2.jpg', '2025-12-23 09:38:12.918341', 11),
(24, 'products/gallery/gallery_12_0.jpg', '2025-12-23 09:38:12.918341', 12),
(25, 'products/gallery/gallery_12_1.jpg', '2025-12-23 09:38:12.918341', 12),
(26, 'products/gallery/gallery_12_2.jpg', '2025-12-23 09:38:12.918341', 12),
(27, 'products/gallery/gallery_13_0.jpg', '2025-12-23 09:38:12.918341', 13),
(28, 'products/gallery/gallery_13_1.jpg', '2025-12-23 09:38:12.918341', 13),
(29, 'products/gallery/gallery_13_2.jpg', '2025-12-23 09:38:12.918341', 13),
(30, 'products/gallery/gallery_14_0.jpg', '2025-12-23 09:38:12.918341', 14),
(31, 'products/gallery/gallery_14_1.jpg', '2025-12-23 09:38:12.918341', 14),
(32, 'products/gallery/gallery_14_2.jpg', '2025-12-23 09:38:12.918341', 14),
(33, 'products/gallery/gallery_15_0.jpg', '2025-12-23 09:38:12.918341', 15),
(34, 'products/gallery/gallery_15_1.jpg', '2025-12-23 09:38:12.918341', 15),
(35, 'products/gallery/gallery_15_2.jpg', '2025-12-23 09:38:12.918341', 15),
(36, 'products/gallery/gallery_16_0.jpg', '2025-12-23 09:38:12.918341', 16),
(37, 'products/gallery/gallery_17_0.jpg', '2025-12-23 09:38:12.918341', 17),
(38, 'products/gallery/gallery_18_0.jpg', '2025-12-23 09:38:12.918341', 18),
(39, 'products/gallery/gallery_19_0.jpg', '2025-12-23 09:38:12.918341', 19),
(40, 'products/gallery/gallery_19_1.jpg', '2025-12-23 09:38:12.918341', 19),
(41, 'products/gallery/gallery_20_0.jpg', '2025-12-23 09:38:12.918341', 20),
(42, 'products/gallery/gallery_21_0.jpg', '2025-12-23 09:38:12.918341', 21),
(43, 'products/gallery/gallery_22_0.jpg', '2025-12-23 09:38:12.918341', 22),
(44, 'products/gallery/gallery_23_0_gSwoYyu.jpg', '2025-12-23 09:38:12.918341', 23),
(45, 'products/gallery/gallery_24_0_pVR0IAZ.jpg', '2025-12-23 09:38:12.918341', 24),
(46, 'products/gallery/gallery_25_0_FUMKAa3.jpg', '2025-12-23 09:38:12.918341', 25),
(47, 'products/gallery/gallery_26_0_Jv2ReEo.jpg', '2025-12-23 09:38:12.918341', 26),
(48, 'products/gallery/gallery_27_0_p0Tjlcb.jpg', '2025-12-23 09:38:12.918341', 27),
(49, 'products/gallery/gallery_28_0_eOlOqi1.jpg', '2025-12-23 09:38:12.918341', 28),
(50, 'products/gallery/gallery_28_1_48eR4sA.jpg', '2025-12-23 09:38:12.918341', 28),
(51, 'products/gallery/gallery_28_2_TbiyTqq.jpg', '2025-12-23 09:38:12.918341', 28),
(52, 'products/gallery/gallery_28_3.jpg', '2025-12-23 09:38:12.918341', 28),
(53, 'products/gallery/gallery_29_0_wx3gRwn.jpg', '2025-12-23 09:38:12.918341', 29),
(54, 'products/gallery/gallery_30_0_d8MuAdw.jpg', '2025-12-23 09:38:12.918341', 30),
(55, 'products/gallery/gallery_31_0_1iGfL7y.jpg', '2025-12-23 09:38:12.918341', 31),
(56, 'products/gallery/gallery_32_0_yRg2QCy.jpg', '2025-12-23 09:38:12.918341', 32),
(57, 'products/gallery/gallery_33_0_diYRDuu.jpg', '2025-12-23 09:38:12.918341', 33),
(58, 'products/gallery/gallery_34_0_Od08v9v.jpg', '2025-12-23 09:38:12.918341', 34),
(59, 'products/gallery/gallery_35_0_Oy9kO1B.jpg', '2025-12-23 09:38:12.918341', 35),
(60, 'products/gallery/gallery_36_0_hr8wh9Q.jpg', '2025-12-23 09:38:12.918341', 36),
(61, 'products/gallery/gallery_37_0_bD0VJ2H.jpg', '2025-12-23 09:38:12.918341', 37),
(62, 'products/gallery/gallery_38_0_I6WC20v.jpg', '2025-12-23 09:38:12.918341', 38),
(63, 'products/gallery/gallery_39_0_VPEJDPW.jpg', '2025-12-23 09:38:12.918341', 39),
(64, 'products/gallery/gallery_40_0_NreWqXq.jpg', '2025-12-23 09:38:12.918341', 40),
(65, 'products/gallery/gallery_41_0_U0hxb14.jpg', '2025-12-23 09:38:12.918341', 41),
(66, 'products/gallery/gallery_41_1_nFWvTol.jpg', '2025-12-23 09:38:12.918341', 41),
(67, 'products/gallery/gallery_42_0_bTsLEWd.jpg', '2025-12-23 09:38:12.918341', 42),
(68, 'products/gallery/gallery_43_0_yZnUFby.jpg', '2025-12-23 09:38:12.918341', 43),
(69, 'products/gallery/gallery_43_1.jpg', '2025-12-23 09:38:12.918341', 43),
(70, 'products/gallery/gallery_43_2.jpg', '2025-12-23 09:38:12.918341', 43),
(71, 'products/gallery/gallery_44_0_f1rzKRN.jpg', '2025-12-23 09:38:12.918341', 44),
(72, 'products/gallery/gallery_45_0_seyqIuJ.jpg', '2025-12-23 09:38:12.918341', 45),
(73, 'products/gallery/gallery_45_1.jpg', '2025-12-23 09:38:12.918341', 45),
(74, 'products/gallery/gallery_45_2.jpg', '2025-12-23 09:38:12.918341', 45),
(75, 'products/gallery/gallery_46_0_lqMRDZy.jpg', '2025-12-23 09:38:12.918341', 46),
(76, 'products/gallery/gallery_46_1.jpg', '2025-12-23 09:38:12.918341', 46),
(77, 'products/gallery/gallery_46_2.jpg', '2025-12-23 09:38:12.918341', 46),
(78, 'products/gallery/gallery_46_3.jpg', '2025-12-23 09:38:12.918341', 46),
(79, 'products/gallery/gallery_47_0_LY6vY4v.jpg', '2025-12-23 09:38:12.918341', 47),
(80, 'products/gallery/gallery_48_0_zI09Opx.jpg', '2025-12-23 09:38:12.918341', 48),
(81, 'products/gallery/gallery_49_0_UoG0TFq.jpg', '2025-12-23 09:38:12.918341', 49),
(82, 'products/gallery/gallery_49_1_f9Q79pz.jpg', '2025-12-23 09:38:12.918341', 49),
(83, 'products/gallery/gallery_50_0_4J2a2MV.jpg', '2025-12-23 09:38:12.918341', 50),
(84, 'products/gallery/gallery_51_0_giIY7rU.jpg', '2025-12-23 09:38:12.918341', 51),
(85, 'products/gallery/gallery_51_1_R1tm1QD.jpg', '2025-12-23 09:38:12.918341', 51),
(86, 'products/gallery/gallery_51_2_JJvz8PZ.jpg', '2025-12-23 09:38:12.918341', 51),
(87, 'products/gallery/gallery_51_3.jpg', '2025-12-23 09:38:12.918341', 51),
(88, 'products/gallery/gallery_52_0_T43mCig.jpg', '2025-12-23 09:38:12.918341', 52),
(89, 'products/gallery/gallery_53_0_HO706dK.jpg', '2025-12-23 09:38:12.918341', 53),
(90, 'products/gallery/gallery_54_0_RzYkbGN.jpg', '2025-12-23 09:38:12.918341', 54),
(91, 'products/gallery/gallery_55_0_hXRmWmu.jpg', '2025-12-23 09:38:12.918341', 55),
(92, 'products/gallery/gallery_56_0_Hknr9ky.jpg', '2025-12-23 09:38:12.918341', 56),
(93, 'products/gallery/gallery_56_1_DzAXn9n.jpg', '2025-12-23 09:38:12.918341', 56),
(94, 'products/gallery/gallery_56_2_FZ4E4E6.jpg', '2025-12-23 09:38:12.918341', 56),
(95, 'products/gallery/gallery_56_3.jpg', '2025-12-23 09:38:12.918341', 56),
(96, 'products/gallery/gallery_57_0_gPNxXQl.jpg', '2025-12-23 09:38:12.918341', 57),
(97, 'products/gallery/gallery_58_0_sYfhSpD.jpg', '2025-12-23 09:38:12.918341', 58),
(98, 'products/gallery/gallery_59_0_bCXN2tQ.jpg', '2025-12-23 09:38:12.918341', 59),
(99, 'products/gallery/gallery_60_0_V6ubfnb.jpg', '2025-12-23 09:38:12.918341', 60),
(100, 'products/gallery/gallery_61_0_sjBv6eW.jpg', '2025-12-23 09:38:12.918341', 61),
(101, 'products/gallery/gallery_62_0_LKFTd6t.jpg', '2025-12-23 09:38:12.918341', 62),
(102, 'products/gallery/gallery_63_0_bplZSy3.jpg', '2025-12-23 09:38:12.918341', 63),
(103, 'products/gallery/gallery_64_0_APEQZO5.jpg', '2025-12-23 09:38:12.918341', 64),
(104, 'products/gallery/gallery_65_0_j1uEhoz.jpg', '2025-12-23 09:38:12.918341', 65),
(105, 'products/gallery/gallery_66_0_lszlHXP.jpg', '2025-12-23 09:38:12.918341', 66),
(106, 'products/gallery/gallery_66_1.jpg', '2025-12-23 09:38:12.918341', 66),
(107, 'products/gallery/gallery_66_2.jpg', '2025-12-23 09:38:12.918341', 66),
(108, 'products/gallery/gallery_66_3.jpg', '2025-12-23 09:38:12.918341', 66),
(109, 'products/gallery/gallery_67_0_J0syHrS.jpg', '2025-12-23 09:38:12.918341', 67),
(110, 'products/gallery/gallery_67_1.jpg', '2025-12-23 09:38:12.918341', 67),
(111, 'products/gallery/gallery_68_0_HfwhKo7.jpg', '2025-12-23 09:38:12.918341', 68),
(112, 'products/gallery/gallery_69_0_VYurpps.jpg', '2025-12-23 09:38:12.918341', 69),
(113, 'products/gallery/gallery_70_0_EV76UQb.jpg', '2025-12-23 09:38:12.918341', 70),
(114, 'products/gallery/gallery_71_0_lL70HMz.jpg', '2025-12-23 09:38:12.918341', 71),
(115, 'products/gallery/gallery_72_0_q7DFfz7.jpg', '2025-12-23 09:38:12.918341', 72),
(116, 'products/gallery/gallery_73_0_UrdQmBq.jpg', '2025-12-23 09:38:12.918341', 73),
(117, 'products/gallery/gallery_74_0_cMXXBR3.jpg', '2025-12-23 09:38:12.918341', 74),
(118, 'products/gallery/gallery_75_0_wVAnqav.jpg', '2025-12-23 09:38:12.918341', 75),
(119, 'products/gallery/gallery_76_0_2o3JgHI.jpg', '2025-12-23 09:38:12.918341', 76),
(120, 'products/gallery/gallery_77_0_Pn9KLiU.jpg', '2025-12-23 09:38:12.918341', 77),
(121, 'products/gallery/gallery_78_0_DU0JCn8.jpg', '2025-12-23 09:38:12.918341', 78),
(122, 'products/gallery/gallery_78_1.jpg', '2025-12-23 09:38:12.918341', 78),
(123, 'products/gallery/gallery_78_2.jpg', '2025-12-23 09:38:12.918341', 78),
(124, 'products/gallery/gallery_79_0_UHm8hs8.jpg', '2025-12-23 09:38:12.918341', 79),
(125, 'products/gallery/gallery_79_1.jpg', '2025-12-23 09:38:12.918341', 79),
(126, 'products/gallery/gallery_79_2.jpg', '2025-12-23 09:38:12.918341', 79),
(127, 'products/gallery/gallery_80_0_Z5Hmqb7.jpg', '2025-12-23 09:38:12.918341', 80),
(128, 'products/gallery/gallery_80_1.jpg', '2025-12-23 09:38:12.918341', 80),
(129, 'products/gallery/gallery_80_2.jpg', '2025-12-23 09:38:12.918341', 80),
(130, 'products/gallery/gallery_81_0_dfTjjKN.jpg', '2025-12-23 09:38:12.918341', 81),
(131, 'products/gallery/gallery_81_1_iko5aOb.jpg', '2025-12-23 09:38:12.918341', 81),
(132, 'products/gallery/gallery_81_2.jpg', '2025-12-23 09:38:12.918341', 81),
(133, 'products/gallery/gallery_82_0_Nxl9XhL.jpg', '2025-12-23 09:38:12.918341', 82),
(134, 'products/gallery/gallery_82_1.jpg', '2025-12-23 09:38:12.918341', 82),
(135, 'products/gallery/gallery_82_2.jpg', '2025-12-23 09:38:12.918341', 82),
(136, 'products/gallery/gallery_83_0_o36jQss.jpg', '2025-12-23 09:38:12.918341', 83),
(137, 'products/gallery/gallery_83_1.jpg', '2025-12-23 09:38:12.918341', 83),
(138, 'products/gallery/gallery_83_2.jpg', '2025-12-23 09:38:12.918341', 83),
(139, 'products/gallery/gallery_83_3.jpg', '2025-12-23 09:38:12.918341', 83),
(140, 'products/gallery/gallery_84_0_ZncFj9d.jpg', '2025-12-23 09:38:12.918341', 84),
(141, 'products/gallery/gallery_84_1.jpg', '2025-12-23 09:38:12.918341', 84),
(142, 'products/gallery/gallery_84_2.jpg', '2025-12-23 09:38:12.918341', 84),
(143, 'products/gallery/gallery_84_3.jpg', '2025-12-23 09:38:12.918341', 84),
(144, 'products/gallery/gallery_85_0_CjosA2r.jpg', '2025-12-23 09:38:12.918341', 85),
(145, 'products/gallery/gallery_85_1.jpg', '2025-12-23 09:38:12.918341', 85),
(146, 'products/gallery/gallery_85_2.jpg', '2025-12-23 09:38:12.918341', 85),
(147, 'products/gallery/gallery_85_3.jpg', '2025-12-23 09:38:12.918341', 85),
(148, 'products/gallery/gallery_86_0_ClnYCWV.jpg', '2025-12-23 09:38:12.918341', 86),
(149, 'products/gallery/gallery_86_1.jpg', '2025-12-23 09:38:12.918341', 86),
(150, 'products/gallery/gallery_86_2.jpg', '2025-12-23 09:38:12.918341', 86),
(151, 'products/gallery/gallery_86_3.jpg', '2025-12-23 09:38:12.918341', 86),
(152, 'products/gallery/gallery_87_0_IzjH2fS.jpg', '2025-12-23 09:38:12.918341', 87),
(153, 'products/gallery/gallery_87_1.jpg', '2025-12-23 09:38:12.918341', 87),
(154, 'products/gallery/gallery_87_2.jpg', '2025-12-23 09:38:12.918341', 87),
(155, 'products/gallery/gallery_87_3.jpg', '2025-12-23 09:38:12.918341', 87),
(156, 'products/gallery/gallery_88_0_Z6L3UeT.jpg', '2025-12-23 09:38:12.918341', 88),
(157, 'products/gallery/gallery_88_1.jpg', '2025-12-23 09:38:12.918341', 88),
(158, 'products/gallery/gallery_88_2.jpg', '2025-12-23 09:38:12.918341', 88),
(159, 'products/gallery/gallery_88_3.jpg', '2025-12-23 09:38:12.918341', 88),
(160, 'products/gallery/gallery_89_0_L6pJ8KV.jpg', '2025-12-23 09:38:12.918341', 89),
(161, 'products/gallery/gallery_89_1.jpg', '2025-12-23 09:38:12.918341', 89),
(162, 'products/gallery/gallery_89_2.jpg', '2025-12-23 09:38:12.918341', 89),
(163, 'products/gallery/gallery_89_3.jpg', '2025-12-23 09:38:12.918341', 89),
(164, 'products/gallery/gallery_90_0_KEWdp3B.jpg', '2025-12-23 09:38:12.918341', 90),
(165, 'products/gallery/gallery_90_1_daoxO7v.jpg', '2025-12-23 09:38:12.918341', 90),
(166, 'products/gallery/gallery_90_2_Rc03Jxs.jpg', '2025-12-23 09:38:12.918341', 90),
(167, 'products/gallery/gallery_90_3_UMfHPyU.jpg', '2025-12-23 09:38:12.918341', 90),
(168, 'products/gallery/gallery_91_0_Z0s0YLe.jpg', '2025-12-23 09:38:12.918341', 91),
(169, 'products/gallery/gallery_91_1.jpg', '2025-12-23 09:38:12.918341', 91),
(170, 'products/gallery/gallery_91_2.jpg', '2025-12-23 09:38:12.918341', 91),
(171, 'products/gallery/gallery_91_3.jpg', '2025-12-23 09:38:12.918341', 91),
(172, 'products/gallery/gallery_92_0_huRTUKF.jpg', '2025-12-23 09:38:12.918341', 92),
(173, 'products/gallery/gallery_92_1.jpg', '2025-12-23 09:38:12.918341', 92),
(174, 'products/gallery/gallery_92_2.jpg', '2025-12-23 09:38:12.918341', 92),
(175, 'products/gallery/gallery_92_3.jpg', '2025-12-23 09:38:12.918341', 92),
(176, 'products/gallery/gallery_93_0_5L9wp1h.jpg', '2025-12-23 09:38:12.918341', 93),
(177, 'products/gallery/gallery_93_1.jpg', '2025-12-23 09:38:12.918341', 93),
(178, 'products/gallery/gallery_93_2.jpg', '2025-12-23 09:38:12.918341', 93),
(179, 'products/gallery/gallery_94_0_fMH38nD.jpg', '2025-12-23 09:38:12.918341', 94),
(180, 'products/gallery/gallery_94_1.jpg', '2025-12-23 09:38:12.918341', 94),
(181, 'products/gallery/gallery_94_2.jpg', '2025-12-23 09:38:12.918341', 94),
(182, 'products/gallery/gallery_95_0_M3KpYun.jpg', '2025-12-23 09:38:12.918341', 95),
(183, 'products/gallery/gallery_95_1.jpg', '2025-12-23 09:38:12.918341', 95),
(184, 'products/gallery/gallery_95_2.jpg', '2025-12-23 09:38:12.918341', 95),
(185, 'products/gallery/gallery_96_0_5vYvv15.jpg', '2025-12-23 09:38:12.918341', 96),
(186, 'products/gallery/gallery_96_1.jpg', '2025-12-23 09:38:12.918341', 96),
(187, 'products/gallery/gallery_96_2.jpg', '2025-12-23 09:38:12.918341', 96),
(188, 'products/gallery/gallery_97_0_Iam64Nz.jpg', '2025-12-23 09:38:12.918341', 97),
(189, 'products/gallery/gallery_97_1.jpg', '2025-12-23 09:38:12.918341', 97),
(190, 'products/gallery/gallery_97_2.jpg', '2025-12-23 09:38:12.918341', 97),
(191, 'products/gallery/gallery_98_0_dX0vKT7.jpg', '2025-12-23 09:38:12.918341', 98),
(192, 'products/gallery/gallery_98_1.jpg', '2025-12-23 09:38:12.918341', 98),
(193, 'products/gallery/gallery_98_2.jpg', '2025-12-23 09:38:12.918341', 98),
(194, 'products/gallery/gallery_99_0_esXHC05.jpg', '2025-12-23 09:38:12.918341', 99),
(195, 'products/gallery/gallery_99_1.jpg', '2025-12-23 09:38:12.918341', 99),
(196, 'products/gallery/gallery_100_0_FnCjtBz.jpg', '2025-12-23 09:38:12.918341', 100),
(197, 'products/gallery/gallery_100_1.jpg', '2025-12-23 09:38:12.918341', 100),
(198, 'products/gallery/gallery_100_2.jpg', '2025-12-23 09:38:12.918341', 100),
(199, 'products/gallery/gallery_101_0_u8ZRrLy.jpg', '2025-12-23 09:38:12.918341', 101),
(200, 'products/gallery/gallery_102_0_retsOf4.jpg', '2025-12-23 09:38:12.918341', 102),
(201, 'products/gallery/gallery_103_0_vXDnsNY.jpg', '2025-12-23 09:38:12.918341', 103),
(202, 'products/gallery/gallery_104_0_lka66OW.jpg', '2025-12-23 09:38:12.918341', 104),
(203, 'products/gallery/gallery_104_1.jpg', '2025-12-23 09:38:12.918341', 104),
(204, 'products/gallery/gallery_105_0_PVc20WF.jpg', '2025-12-23 09:38:12.918341', 105),
(205, 'products/gallery/gallery_105_1_ma6ifKC.jpg', '2025-12-23 09:38:12.918341', 105),
(206, 'products/gallery/gallery_106_0_tyBKput.jpg', '2025-12-23 09:38:12.918341', 106),
(207, 'products/gallery/gallery_106_1.jpg', '2025-12-23 09:38:12.918341', 106),
(208, 'products/gallery/gallery_106_2.jpg', '2025-12-23 09:38:12.918341', 106),
(209, 'products/gallery/gallery_107_0_a5uuCG1.jpg', '2025-12-23 09:38:12.918341', 107),
(210, 'products/gallery/gallery_108_0_CroDyh5.jpg', '2025-12-23 09:38:12.918341', 108),
(211, 'products/gallery/gallery_108_1_EWtHUjC.jpg', '2025-12-23 09:38:12.918341', 108),
(212, 'products/gallery/gallery_108_2_JkNvPM0.jpg', '2025-12-23 09:38:12.918341', 108),
(213, 'products/gallery/gallery_108_3_8BsK4fs.jpg', '2025-12-23 09:38:12.918341', 108),
(214, 'products/gallery/gallery_109_0_T6Qwooe.jpg', '2025-12-23 09:38:12.918341', 109),
(215, 'products/gallery/gallery_109_1.jpg', '2025-12-23 09:38:12.918341', 109),
(216, 'products/gallery/gallery_110_0_yFbYGsz.jpg', '2025-12-23 09:38:12.918341', 110),
(217, 'products/gallery/gallery_111_0_68VjtY4.jpg', '2025-12-23 09:38:12.918341', 111),
(218, 'products/gallery/gallery_112_0_sQMRmPV.jpg', '2025-12-23 09:38:12.918341', 112),
(219, 'products/gallery/gallery_113_0_b4aInPH.jpg', '2025-12-23 09:38:12.918341', 113),
(220, 'products/gallery/gallery_113_1_YF1uWAh.jpg', '2025-12-23 09:38:12.918341', 113),
(221, 'products/gallery/gallery_113_2_TqMyyDq.jpg', '2025-12-23 09:38:12.918341', 113),
(222, 'products/gallery/gallery_113_3_zT0mkms.jpg', '2025-12-23 09:38:12.918341', 113),
(223, 'products/gallery/gallery_114_0_o9QyaJI.jpg', '2025-12-23 09:38:12.918341', 114),
(224, 'products/gallery/gallery_114_1.jpg', '2025-12-23 09:38:12.918341', 114),
(225, 'products/gallery/gallery_114_2.jpg', '2025-12-23 09:38:12.918341', 114),
(226, 'products/gallery/gallery_114_3.jpg', '2025-12-23 09:38:12.918341', 114),
(227, 'products/gallery/gallery_115_0_khZwkPL.jpg', '2025-12-23 09:38:12.918341', 115),
(228, 'products/gallery/gallery_115_1.jpg', '2025-12-23 09:38:12.918341', 115),
(229, 'products/gallery/gallery_115_2.jpg', '2025-12-23 09:38:12.918341', 115),
(230, 'products/gallery/gallery_115_3.jpg', '2025-12-23 09:38:12.918341', 115),
(231, 'products/gallery/gallery_116_0_bv7npjt.jpg', '2025-12-23 09:38:12.918341', 116),
(232, 'products/gallery/gallery_116_1.jpg', '2025-12-23 09:38:12.918341', 116),
(233, 'products/gallery/gallery_116_2.jpg', '2025-12-23 09:38:12.918341', 116),
(234, 'products/gallery/gallery_116_3.jpg', '2025-12-23 09:38:12.918341', 116),
(235, 'products/gallery/gallery_117_0_ciT2lLV.jpg', '2025-12-23 09:38:12.918341', 117),
(236, 'products/gallery/gallery_117_1.jpg', '2025-12-23 09:38:12.918341', 117),
(237, 'products/gallery/gallery_117_2.jpg', '2025-12-23 09:38:12.918341', 117),
(238, 'products/gallery/gallery_117_3.jpg', '2025-12-23 09:38:12.918341', 117),
(239, 'products/gallery/gallery_118_0_F1HCmkv.jpg', '2025-12-23 09:38:12.918341', 118),
(240, 'products/gallery/gallery_118_1_h4D2MBq.jpg', '2025-12-23 09:38:12.918341', 118),
(241, 'products/gallery/gallery_118_2_uLRyNI7.jpg', '2025-12-23 09:38:12.918341', 118),
(242, 'products/gallery/gallery_119_0_zLQhySb.jpg', '2025-12-23 09:38:12.918341', 119),
(243, 'products/gallery/gallery_119_1.jpg', '2025-12-23 09:38:12.918341', 119),
(244, 'products/gallery/gallery_119_2.jpg', '2025-12-23 09:38:12.918341', 119),
(245, 'products/gallery/gallery_120_0_AKUAvtq.jpg', '2025-12-23 09:38:12.918341', 120),
(246, 'products/gallery/gallery_120_1.jpg', '2025-12-23 09:38:12.918341', 120),
(247, 'products/gallery/gallery_120_2.jpg', '2025-12-23 09:38:12.918341', 120),
(248, 'products/gallery/gallery_121_0_7H8J9qG.jpg', '2025-12-23 09:38:12.918341', 121),
(249, 'products/gallery/gallery_121_1.jpg', '2025-12-23 09:38:12.918341', 121),
(250, 'products/gallery/gallery_121_2.jpg', '2025-12-23 09:38:12.918341', 121),
(251, 'products/gallery/gallery_122_0_85kRZPu.jpg', '2025-12-23 09:38:12.918341', 122),
(252, 'products/gallery/gallery_122_1.jpg', '2025-12-23 09:38:12.918341', 122),
(253, 'products/gallery/gallery_122_2.jpg', '2025-12-23 09:38:12.918341', 122),
(254, 'products/gallery/gallery_123_0_4Un7Myc.jpg', '2025-12-23 09:38:12.918341', 123),
(255, 'products/gallery/gallery_123_1.jpg', '2025-12-23 09:38:12.918341', 123),
(256, 'products/gallery/gallery_123_2.jpg', '2025-12-23 09:38:12.918341', 123),
(257, 'products/gallery/gallery_124_0_Lfiw82Z.jpg', '2025-12-23 09:38:12.918341', 124),
(258, 'products/gallery/gallery_124_1.jpg', '2025-12-23 09:38:12.918341', 124),
(259, 'products/gallery/gallery_124_2.jpg', '2025-12-23 09:38:12.918341', 124),
(260, 'products/gallery/gallery_125_0_JjkBNOQ.jpg', '2025-12-23 09:38:12.918341', 125),
(261, 'products/gallery/gallery_125_1.jpg', '2025-12-23 09:38:12.918341', 125),
(262, 'products/gallery/gallery_125_2.jpg', '2025-12-23 09:38:12.918341', 125),
(263, 'products/gallery/gallery_126_0_tr1JHGe.jpg', '2025-12-23 09:38:12.918341', 126),
(264, 'products/gallery/gallery_126_1.jpg', '2025-12-23 09:38:12.918341', 126),
(265, 'products/gallery/gallery_126_2.jpg', '2025-12-23 09:38:12.918341', 126),
(266, 'products/gallery/gallery_127_0_eYDGgNs.jpg', '2025-12-23 09:38:12.918341', 127),
(267, 'products/gallery/gallery_127_1.jpg', '2025-12-23 09:38:12.918341', 127),
(268, 'products/gallery/gallery_127_2.jpg', '2025-12-23 09:38:12.918341', 127),
(269, 'products/gallery/gallery_127_3.jpg', '2025-12-23 09:38:12.918341', 127),
(270, 'products/gallery/gallery_128_0_kXGFraF.jpg', '2025-12-23 09:38:12.918341', 128),
(271, 'products/gallery/gallery_128_1_CZ278a6.jpg', '2025-12-23 09:38:12.918341', 128),
(272, 'products/gallery/gallery_128_2_D15OXyH.jpg', '2025-12-23 09:38:12.918341', 128),
(273, 'products/gallery/gallery_129_0_9Q3g1LR.jpg', '2025-12-23 09:38:12.918341', 129),
(274, 'products/gallery/gallery_129_1_wcZDQTc.jpg', '2025-12-23 09:38:12.918341', 129),
(275, 'products/gallery/gallery_129_2.jpg', '2025-12-23 09:38:12.918341', 129),
(276, 'products/gallery/gallery_130_0_Kf9xSrT.jpg', '2025-12-23 09:38:12.918341', 130),
(277, 'products/gallery/gallery_130_1.jpg', '2025-12-23 09:38:12.918341', 130),
(278, 'products/gallery/gallery_130_2.jpg', '2025-12-23 09:38:12.918341', 130),
(279, 'products/gallery/gallery_131_0_V2usLlV.jpg', '2025-12-23 09:38:12.918341', 131),
(280, 'products/gallery/gallery_131_1.jpg', '2025-12-23 09:38:12.918341', 131),
(281, 'products/gallery/gallery_131_2.jpg', '2025-12-23 09:38:12.918341', 131),
(282, 'products/gallery/gallery_132_0_ucm5jKA.jpg', '2025-12-23 09:38:12.918341', 132),
(283, 'products/gallery/gallery_132_1.jpg', '2025-12-23 09:38:12.918341', 132),
(284, 'products/gallery/gallery_132_2.jpg', '2025-12-23 09:38:12.918341', 132),
(285, 'products/gallery/gallery_133_0_0OpwghQ.jpg', '2025-12-23 09:38:12.918341', 133),
(286, 'products/gallery/gallery_133_1.jpg', '2025-12-23 09:38:12.918341', 133),
(287, 'products/gallery/gallery_133_2.jpg', '2025-12-23 09:38:12.918341', 133),
(288, 'products/gallery/gallery_134_0_fV0fXnS.jpg', '2025-12-23 09:38:12.918341', 134),
(289, 'products/gallery/gallery_134_1.jpg', '2025-12-23 09:38:12.918341', 134),
(290, 'products/gallery/gallery_134_2.jpg', '2025-12-23 09:38:12.918341', 134),
(291, 'products/gallery/gallery_135_0_CDdZ3sS.jpg', '2025-12-23 09:38:12.918341', 135),
(292, 'products/gallery/gallery_135_1.jpg', '2025-12-23 09:38:12.918341', 135),
(293, 'products/gallery/gallery_135_2.jpg', '2025-12-23 09:38:12.918341', 135),
(294, 'products/gallery/gallery_136_0_tUU2Cwi.jpg', '2025-12-23 09:38:12.918341', 136),
(295, 'products/gallery/gallery_136_1.jpg', '2025-12-23 09:38:12.918341', 136),
(296, 'products/gallery/gallery_136_2.jpg', '2025-12-23 09:38:12.918341', 136),
(297, 'products/gallery/gallery_137_0_9oMJ22R.jpg', '2025-12-23 09:38:12.918341', 137),
(298, 'products/gallery/gallery_138_0_yWjTlgc.jpg', '2025-12-23 09:38:12.918341', 138),
(299, 'products/gallery/gallery_139_0_x5Rj0oP.jpg', '2025-12-23 09:38:12.918341', 139),
(300, 'products/gallery/gallery_139_1.jpg', '2025-12-23 09:38:12.918341', 139),
(301, 'products/gallery/gallery_139_2.jpg', '2025-12-23 09:38:12.918341', 139),
(302, 'products/gallery/gallery_140_0_hTRXg82.jpg', '2025-12-23 09:38:12.918341', 140),
(303, 'products/gallery/gallery_141_0_hn7vstl.jpg', '2025-12-23 09:38:12.918341', 141),
(304, 'products/gallery/gallery_142_0_gWj1d8Y.jpg', '2025-12-23 09:38:12.918341', 142),
(305, 'products/gallery/gallery_143_0_rshkirs.jpg', '2025-12-23 09:38:12.918341', 143),
(306, 'products/gallery/gallery_144_0_wies0Ip.jpg', '2025-12-23 09:38:12.918341', 144),
(307, 'products/gallery/gallery_144_1_VT1XKqi.jpg', '2025-12-23 09:38:12.918341', 144),
(308, 'products/gallery/gallery_144_2_xmwF9G3.jpg', '2025-12-23 09:38:12.918341', 144),
(309, 'products/gallery/gallery_144_3.jpg', '2025-12-23 09:38:12.918341', 144),
(310, 'products/gallery/gallery_145_0_GN6s3Tr.jpg', '2025-12-23 09:38:12.918341', 145),
(311, 'products/gallery/gallery_146_0_83RrDPc.jpg', '2025-12-23 09:38:12.918341', 146),
(312, 'products/gallery/gallery_147_0_qvQBexA.jpg', '2025-12-23 09:38:12.918341', 147),
(313, 'products/gallery/gallery_148_0_hEsGBlR.jpg', '2025-12-23 09:38:12.918341', 148),
(314, 'products/gallery/gallery_149_0_aOSi5SL.jpg', '2025-12-23 09:38:12.918341', 149),
(315, 'products/gallery/gallery_150_0_TyGVM2E.jpg', '2025-12-23 09:38:12.918341', 150),
(316, 'products/gallery/gallery_151_0_GvW8gDI.jpg', '2025-12-23 09:38:12.918341', 151),
(317, 'products/gallery/gallery_152_0_aLmZtwl.jpg', '2025-12-23 09:38:12.918341', 152),
(318, 'products/gallery/gallery_153_0_bTWywC3.jpg', '2025-12-23 09:38:12.918341', 153),
(319, 'products/gallery/gallery_154_0_U6R3u21.jpg', '2025-12-23 09:38:12.918341', 154),
(320, 'products/gallery/gallery_154_1_dS5j9oB.jpg', '2025-12-23 09:38:12.918341', 154),
(321, 'products/gallery/gallery_154_2_lR94ti7.jpg', '2025-12-23 09:38:12.918341', 154),
(322, 'products/gallery/gallery_155_0_TQJfaCo.jpg', '2025-12-23 09:38:12.918341', 155),
(323, 'products/gallery/gallery_155_1_ulq8InN.jpg', '2025-12-23 09:38:12.918341', 155),
(324, 'products/gallery/gallery_155_2_mGmalQx.jpg', '2025-12-23 09:38:12.918341', 155),
(325, 'products/gallery/gallery_156_0_ZYefNod.jpg', '2025-12-23 09:38:12.918341', 156),
(326, 'products/gallery/gallery_156_1_TJGkabq.jpg', '2025-12-23 09:38:12.918341', 156),
(327, 'products/gallery/gallery_156_2_DcH3dtQ.jpg', '2025-12-23 09:38:12.918341', 156),
(328, 'products/gallery/gallery_157_0_VM52kLf.jpg', '2025-12-23 09:38:12.918341', 157),
(329, 'products/gallery/gallery_157_1_odbV2vN.jpg', '2025-12-23 09:38:12.918341', 157),
(330, 'products/gallery/gallery_157_2_zP3peYD.jpg', '2025-12-23 09:38:12.918341', 157),
(331, 'products/gallery/gallery_158_0_vbx3MOb.jpg', '2025-12-23 09:38:12.918341', 158),
(332, 'products/gallery/gallery_158_1_e6muiKi.jpg', '2025-12-23 09:38:12.918341', 158),
(333, 'products/gallery/gallery_158_2_rRfhpyi.jpg', '2025-12-23 09:38:12.918341', 158),
(334, 'products/gallery/gallery_159_0_LOyAFwE.jpg', '2025-12-23 09:38:12.918341', 159),
(335, 'products/gallery/gallery_159_1_biXfURM.jpg', '2025-12-23 09:38:12.918341', 159),
(336, 'products/gallery/gallery_159_2_W19x6pm.jpg', '2025-12-23 09:38:12.918341', 159),
(337, 'products/gallery/gallery_159_3.jpg', '2025-12-23 09:38:12.918341', 159),
(338, 'products/gallery/gallery_160_0_2TFRCfa.jpg', '2025-12-23 09:38:12.918341', 160),
(339, 'products/gallery/gallery_160_1_Yi6sU9t.jpg', '2025-12-23 09:38:12.918341', 160),
(340, 'products/gallery/gallery_160_2_rsXRsTM.jpg', '2025-12-23 09:38:12.918341', 160),
(341, 'products/gallery/gallery_160_3.jpg', '2025-12-23 09:38:12.918341', 160),
(342, 'products/gallery/gallery_161_0_yOND9WQ.jpg', '2025-12-23 09:38:12.918341', 161),
(343, 'products/gallery/gallery_161_1_TydlBu4.jpg', '2025-12-23 09:38:12.918341', 161),
(344, 'products/gallery/gallery_161_2.jpg', '2025-12-23 09:38:12.918341', 161),
(345, 'products/gallery/gallery_161_3.jpg', '2025-12-23 09:38:12.918341', 161),
(346, 'products/gallery/gallery_162_0_XVU7Jej.jpg', '2025-12-23 09:38:12.918341', 162),
(347, 'products/gallery/gallery_162_1_vSmX3rZ.jpg', '2025-12-23 09:38:12.918341', 162),
(348, 'products/gallery/gallery_162_2_7bxy28c.jpg', '2025-12-23 09:38:12.918341', 162),
(349, 'products/gallery/gallery_162_3.jpg', '2025-12-23 09:38:12.918341', 162),
(350, 'products/gallery/gallery_163_0_8wmMlDg.jpg', '2025-12-23 09:38:12.918341', 163),
(351, 'products/gallery/gallery_163_1.jpg', '2025-12-23 09:38:12.918341', 163),
(352, 'products/gallery/gallery_163_2.jpg', '2025-12-23 09:38:12.918341', 163),
(353, 'products/gallery/gallery_163_3.jpg', '2025-12-23 09:38:12.918341', 163),
(354, 'products/gallery/gallery_164_0_57YH86R.jpg', '2025-12-23 09:38:12.918341', 164),
(355, 'products/gallery/gallery_164_1.jpg', '2025-12-23 09:38:12.918341', 164),
(356, 'products/gallery/gallery_164_2.jpg', '2025-12-23 09:38:12.918341', 164),
(357, 'products/gallery/gallery_164_3.jpg', '2025-12-23 09:38:12.918341', 164),
(358, 'products/gallery/gallery_165_0_iJzaSgq.jpg', '2025-12-23 09:38:12.918341', 165),
(359, 'products/gallery/gallery_165_1.jpg', '2025-12-23 09:38:12.918341', 165),
(360, 'products/gallery/gallery_165_2.jpg', '2025-12-23 09:38:12.918341', 165),
(361, 'products/gallery/gallery_165_3.jpg', '2025-12-23 09:38:12.918341', 165),
(362, 'products/gallery/gallery_166_0_P7CgkXe.jpg', '2025-12-23 09:38:12.918341', 166),
(363, 'products/gallery/gallery_166_1_CdDlwBG.jpg', '2025-12-23 09:38:12.918341', 166),
(364, 'products/gallery/gallery_166_2.jpg', '2025-12-23 09:38:12.918341', 166),
(365, 'products/gallery/gallery_166_3.jpg', '2025-12-23 09:38:12.918341', 166),
(366, 'products/gallery/gallery_167_0_1V7QRuC.jpg', '2025-12-23 09:38:12.918341', 167),
(367, 'products/gallery/gallery_167_1_opzH0lW.jpg', '2025-12-23 09:38:12.918341', 167),
(368, 'products/gallery/gallery_167_2.jpg', '2025-12-23 09:38:12.918341', 167),
(369, 'products/gallery/gallery_167_3.jpg', '2025-12-23 09:38:12.918341', 167),
(370, 'products/gallery/gallery_167_4.jpg', '2025-12-23 09:38:12.918341', 167),
(371, 'products/gallery/gallery_167_5.jpg', '2025-12-23 09:38:12.918341', 167),
(372, 'products/gallery/gallery_168_0_u2D9TkQ.jpg', '2025-12-23 09:38:12.918341', 168),
(373, 'products/gallery/gallery_168_1_QPPCmVJ.jpg', '2025-12-23 09:38:12.918341', 168),
(374, 'products/gallery/gallery_168_2_0ytx7eJ.jpg', '2025-12-23 09:38:12.918341', 168),
(375, 'products/gallery/gallery_168_3.jpg', '2025-12-23 09:38:12.918341', 168),
(376, 'products/gallery/gallery_168_4.jpg', '2025-12-23 09:38:12.918341', 168),
(377, 'products/gallery/gallery_168_5.jpg', '2025-12-23 09:38:12.918341', 168),
(378, 'products/gallery/gallery_169_0_xOFpqee.jpg', '2025-12-23 09:38:12.918341', 169),
(379, 'products/gallery/gallery_169_1.jpg', '2025-12-23 09:38:12.918341', 169),
(380, 'products/gallery/gallery_169_2.jpg', '2025-12-23 09:38:12.918341', 169),
(381, 'products/gallery/gallery_169_3.jpg', '2025-12-23 09:38:12.918341', 169),
(382, 'products/gallery/gallery_169_4.jpg', '2025-12-23 09:38:12.918341', 169),
(383, 'products/gallery/gallery_169_5.jpg', '2025-12-23 09:38:12.918341', 169),
(384, 'products/gallery/gallery_170_0_IpwQ3U3.jpg', '2025-12-23 09:38:12.918341', 170),
(385, 'products/gallery/gallery_170_1_hBqQbVe.jpg', '2025-12-23 09:38:12.918341', 170),
(386, 'products/gallery/gallery_170_2_L9YymHW.jpg', '2025-12-23 09:38:12.918341', 170),
(387, 'products/gallery/gallery_170_3_NEqWdUB.jpg', '2025-12-23 09:38:12.918341', 170),
(388, 'products/gallery/gallery_170_4.jpg', '2025-12-23 09:38:12.918341', 170),
(389, 'products/gallery/gallery_170_5.jpg', '2025-12-23 09:38:12.918341', 170),
(390, 'products/gallery/gallery_171_0_iGXWFhm.jpg', '2025-12-23 09:38:12.918341', 171),
(391, 'products/gallery/gallery_171_1_MktvwHy.jpg', '2025-12-23 09:38:12.918341', 171),
(392, 'products/gallery/gallery_171_2.jpg', '2025-12-23 09:38:12.918341', 171),
(393, 'products/gallery/gallery_171_3.jpg', '2025-12-23 09:38:12.918341', 171),
(394, 'products/gallery/gallery_171_4.jpg', '2025-12-23 09:38:12.918341', 171),
(395, 'products/gallery/gallery_171_5.jpg', '2025-12-23 09:38:12.918341', 171),
(396, 'products/gallery/gallery_172_0_6mDigFr.jpg', '2025-12-23 09:38:12.918341', 172),
(397, 'products/gallery/gallery_172_1.jpg', '2025-12-23 09:38:12.918341', 172),
(398, 'products/gallery/gallery_172_2.jpg', '2025-12-23 09:38:12.918341', 172),
(399, 'products/gallery/gallery_173_0_pTJBTEv.jpg', '2025-12-23 09:38:12.918341', 173),
(400, 'products/gallery/gallery_173_1.jpg', '2025-12-23 09:38:12.918341', 173),
(401, 'products/gallery/gallery_173_2.jpg', '2025-12-23 09:38:12.918341', 173),
(402, 'products/gallery/gallery_174_0_4mfdLXZ.jpg', '2025-12-23 09:38:12.918341', 174),
(403, 'products/gallery/gallery_174_1.jpg', '2025-12-23 09:38:12.918341', 174),
(404, 'products/gallery/gallery_174_2.jpg', '2025-12-23 09:38:12.918341', 174),
(405, 'products/gallery/gallery_175_0_7uwoyiq.jpg', '2025-12-23 09:38:12.918341', 175),
(406, 'products/gallery/gallery_175_1_Pe6tmIh.jpg', '2025-12-23 09:38:12.918341', 175),
(407, 'products/gallery/gallery_175_2_8fA2r6T.jpg', '2025-12-23 09:38:12.918341', 175),
(408, 'products/gallery/gallery_176_0_6HQKuVr.jpg', '2025-12-23 09:38:12.918341', 176),
(409, 'products/gallery/gallery_176_1_CEqQike.jpg', '2025-12-23 09:38:12.918341', 176),
(410, 'products/gallery/gallery_176_2_LtK8ANg.jpg', '2025-12-23 09:38:12.918341', 176),
(411, 'products/gallery/gallery_177_0_jTyq6UI.jpg', '2025-12-23 09:38:12.918341', 177),
(412, 'products/gallery/gallery_177_1_amwPCCT.jpg', '2025-12-23 09:38:12.918341', 177),
(413, 'products/gallery/gallery_177_2_xiv65jH.jpg', '2025-12-23 09:38:12.918341', 177),
(414, 'products/gallery/gallery_177_3_WgflQVy.jpg', '2025-12-23 09:38:12.918341', 177),
(415, 'products/gallery/gallery_178_0_qTtc0WN.jpg', '2025-12-23 09:38:12.918341', 178),
(416, 'products/gallery/gallery_178_1_c8GIBY9.jpg', '2025-12-23 09:38:12.918341', 178),
(417, 'products/gallery/gallery_178_2_v7UM2Uz.jpg', '2025-12-23 09:38:12.918341', 178),
(418, 'products/gallery/gallery_178_3_RzEVRHb.jpg', '2025-12-23 09:38:12.918341', 178),
(419, 'products/gallery/gallery_179_0_hi9lYIc.jpg', '2025-12-23 09:38:12.918341', 179),
(420, 'products/gallery/gallery_179_1_EfUWs83.jpg', '2025-12-23 09:38:12.918341', 179),
(421, 'products/gallery/gallery_179_2_h5qxXg0.jpg', '2025-12-23 09:38:12.918341', 179),
(422, 'products/gallery/gallery_179_3_G2ec0ao.jpg', '2025-12-23 09:38:12.918341', 179),
(423, 'products/gallery/gallery_180_0_TAFRUFb.jpg', '2025-12-23 09:38:12.918341', 180),
(424, 'products/gallery/gallery_180_1_FLoJ3ZW.jpg', '2025-12-23 09:38:12.918341', 180),
(425, 'products/gallery/gallery_180_2_zfQg9m7.jpg', '2025-12-23 09:38:12.918341', 180),
(426, 'products/gallery/gallery_180_3.jpg', '2025-12-23 09:38:12.918341', 180),
(427, 'products/gallery/gallery_181_0_1t0eS6E.jpg', '2025-12-23 09:38:12.918341', 181),
(428, 'products/gallery/gallery_181_1_xevSsiV.jpg', '2025-12-23 09:38:12.918341', 181),
(429, 'products/gallery/gallery_181_2_tvccx7e.jpg', '2025-12-23 09:38:12.918341', 181),
(430, 'products/gallery/gallery_181_3.jpg', '2025-12-23 09:38:12.918341', 181),
(431, 'products/gallery/gallery_182_0_ht8eJPD.jpg', '2025-12-23 09:38:12.918341', 182),
(432, 'products/gallery/gallery_182_1_a8BtpRT.jpg', '2025-12-23 09:38:12.918341', 182),
(433, 'products/gallery/gallery_182_2_L6ah5my.jpg', '2025-12-23 09:38:12.918341', 182),
(434, 'products/gallery/gallery_183_0_jZAeTGf.jpg', '2025-12-23 09:38:12.918341', 183),
(435, 'products/gallery/gallery_183_1_99OrAbP.jpg', '2025-12-23 09:38:12.918341', 183),
(436, 'products/gallery/gallery_183_2_Ne8aQ8x.jpg', '2025-12-23 09:38:12.918341', 183),
(437, 'products/gallery/gallery_184_0_XXDRFD0.jpg', '2025-12-23 09:38:12.918341', 184),
(438, 'products/gallery/gallery_184_1_1TGUB3s.jpg', '2025-12-23 09:38:12.918341', 184),
(439, 'products/gallery/gallery_184_2_JS19wDN.jpg', '2025-12-23 09:38:12.918341', 184),
(440, 'products/gallery/gallery_185_0_1hu2jsY.jpg', '2025-12-23 09:38:12.918341', 185),
(441, 'products/gallery/gallery_185_1_NTBX2MW.jpg', '2025-12-23 09:38:12.918341', 185),
(442, 'products/gallery/gallery_185_2_Fkmxt8N.jpg', '2025-12-23 09:38:12.918341', 185),
(443, 'products/gallery/gallery_185_3.jpg', '2025-12-23 09:38:12.918341', 185),
(444, 'products/gallery/gallery_186_0_EUsE91W.jpg', '2025-12-23 09:38:12.918341', 186),
(445, 'products/gallery/gallery_186_1_FooYb0U.jpg', '2025-12-23 09:38:12.918341', 186),
(446, 'products/gallery/gallery_186_2_goS7Bst.jpg', '2025-12-23 09:38:12.918341', 186),
(447, 'products/gallery/gallery_186_3.jpg', '2025-12-23 09:38:12.918341', 186),
(448, 'products/gallery/gallery_187_0_1Ztw4a8.jpg', '2025-12-23 09:38:12.918341', 187),
(449, 'products/gallery/gallery_187_1_xR7in2W.jpg', '2025-12-23 09:38:12.918341', 187),
(450, 'products/gallery/gallery_187_2_jlaKYA6.jpg', '2025-12-23 09:38:12.918341', 187),
(451, 'products/gallery/gallery_187_3.jpg', '2025-12-23 09:38:12.918341', 187),
(452, 'products/gallery/gallery_188_0_ZkoKVEg.jpg', '2025-12-23 09:38:12.918341', 188),
(453, 'products/gallery/gallery_188_1_0DMCzi7.jpg', '2025-12-23 09:38:12.918341', 188),
(454, 'products/gallery/gallery_188_2_2fXTVJ5.jpg', '2025-12-23 09:38:12.918341', 188),
(455, 'products/gallery/gallery_188_3.jpg', '2025-12-23 09:38:12.918341', 188),
(456, 'products/gallery/gallery_189_0_wgWTJkU.jpg', '2025-12-23 09:38:12.918341', 189),
(457, 'products/gallery/gallery_189_1_Lw5qvra.jpg', '2025-12-23 09:38:12.918341', 189),
(458, 'products/gallery/gallery_189_2_jVUtp4z.jpg', '2025-12-23 09:38:12.918341', 189),
(459, 'products/gallery/gallery_189_3_zAg8wSv.jpg', '2025-12-23 09:38:12.918341', 189),
(460, 'products/gallery/gallery_190_0_upnZbN5.jpg', '2025-12-23 09:38:12.918341', 190),
(461, 'products/gallery/gallery_190_1_gZfhST3.jpg', '2025-12-23 09:38:12.918341', 190),
(462, 'products/gallery/gallery_190_2_MBDpkfR.jpg', '2025-12-23 09:38:12.918341', 190),
(463, 'products/gallery/gallery_191_0_CM4gALg.jpg', '2025-12-23 09:38:12.918341', 191),
(464, 'products/gallery/gallery_191_1_dEptwGH.jpg', '2025-12-23 09:38:12.918341', 191),
(465, 'products/gallery/gallery_191_2_XZvHEYA.jpg', '2025-12-23 09:38:12.918341', 191),
(466, 'products/gallery/gallery_192_0_jdoXkib.jpg', '2025-12-23 09:38:12.918341', 192),
(467, 'products/gallery/gallery_192_1_72OKMRI.jpg', '2025-12-23 09:38:12.918341', 192),
(468, 'products/gallery/gallery_192_2_HUItDZR.jpg', '2025-12-23 09:38:12.918341', 192),
(469, 'products/gallery/gallery_193_0_bfyNMkT.jpg', '2025-12-23 09:38:12.918341', 193),
(470, 'products/gallery/gallery_193_1_HepnELA.jpg', '2025-12-23 09:38:12.918341', 193),
(471, 'products/gallery/gallery_193_2_amzTd0H.jpg', '2025-12-23 09:38:12.918341', 193),
(472, 'products/gallery/gallery_194_0_DasdQqX.jpg', '2025-12-23 09:38:12.918341', 194),
(473, 'products/gallery/gallery_194_1_JKvqBcQ.jpg', '2025-12-23 09:38:12.918341', 194),
(474, 'products/gallery/gallery_194_2_BFc4cSR.jpg', '2025-12-23 09:38:12.918341', 194),
(484, 'products/gallery/iphone-17-finish-unselect-gallery-1-202509_FMT_WHH_HyLcq3q.jpg', '2025-12-30 01:42:39.496492', 195);

-- --------------------------------------------------------

--
-- Table structure for table `stock_history`
--

CREATE TABLE `stock_history` (
  `id` bigint NOT NULL,
  `change_quantity` int NOT NULL,
  `remaining_stock` int NOT NULL,
  `action` varchar(20) NOT NULL,
  `note` longtext,
  `created_at` datetime(6) NOT NULL,
  `created_by_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_history`
--

INSERT INTO `stock_history` (`id`, `change_quantity`, `remaining_stock`, `action`, `note`, `created_at`, `created_by_id`, `product_id`) VALUES
(1, 11, 30, 'adjustment', 'Manual Edit by Admin', '2026-01-05 09:43:21.759468', 1, 195),
(2, 1, 1, 'adjustment', 'Manual Edit by Admin', '2026-01-05 09:43:51.845134', 1, 193),
(3, -1, 0, 'adjustment', 'Manual Edit by Admin', '2026-01-05 09:47:33.203110', 1, 193),
(4, -5, 25, 'adjustment', 'Manual Edit by Admin', '2026-01-06 01:32:07.412390', 1, 195),
(5, 5, 30, 'adjustment', 'Manual Edit by Admin', '2026-01-06 01:36:09.699426', 1, 195),
(6, 20, 50, 'adjustment', 'Manual Edit by Admin', '2026-01-06 01:37:59.428777', 1, 195),
(7, -1, 10, 'sale', 'Order #25', '2026-01-06 05:12:10.376673', 2, 111),
(8, -1, 27, 'sale', 'Order #26', '2026-01-06 06:18:32.965366', 2, 192),
(9, -1, 49, 'sale', 'Order #27', '2026-01-06 07:12:07.615245', 2, 195),
(10, -1, 5, 'sale', 'Order #27', '2026-01-06 07:12:07.618256', 2, 136),
(11, -1, 81, 'sale', 'Order #27', '2026-01-06 07:12:07.622601', 2, 135),
(12, -2, 8, 'sale', 'Order #28', '2026-01-06 09:27:48.547090', 7, 203),
(13, -2, 8, 'sale', 'Order #29', '2026-01-06 09:28:32.212049', 7, 203),
(14, -1, 48, 'sale', 'Order #30', '2026-01-06 09:31:20.741265', 2, 195),
(15, -1, 26, 'sale', 'Order #30', '2026-01-06 09:31:20.743966', 2, 192),
(16, 1, 9, 'adjustment', 'Manual Edit by Admin', '2026-01-06 09:32:42.505108', 1, 203),
(17, -18, 30, 'adjustment', 'Manual Edit by Admin', '2026-01-06 09:33:26.342463', 1, 195),
(18, -5, 25, 'adjustment', 'Manual Edit by Admin', '2026-01-06 09:39:30.544457', 1, 195),
(19, 2, 35, 'restock', 'Manual Update via Edit Page', '2026-01-06 09:56:54.565349', 1, 194),
(20, 0, 35, 'edit', 'Price: 130.00 -> 130', '2026-01-06 09:56:54.571599', 1, 194),
(21, 5, 40, 'restock', 'Manual Update via Edit Page', '2026-01-06 09:57:09.816040', 1, 194),
(22, 0, 40, 'edit', 'Price: 130.00 -> 130', '2026-01-06 09:57:09.823701', 1, 194);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','seller','customer','new_user') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'new_user',
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `password`, `username`, `first_name`, `last_name`, `email`, `phone`, `address`, `image`, `role`, `is_active`, `date_joined`, `last_login`, `updated_at`) VALUES
(1, 'pbkdf2_sha256$1000000$fO3zWGz0f5pSLK2auUroml$by0ySIFOjYjoBbaSqp7IKJho2Vnl0XdQZBJHoMQslw4=', 'admin', '', '', 'admin@gmail.com', '0999999998', '', 'avatars/Lego_Man.jpg', 'admin', 1, '2025-12-25 03:07:04.491326', '2025-12-25 08:26:35.601991', '2025-12-30 04:05:46.775563'),
(2, 'pbkdf2_sha256$1000000$0wLYOu6zZXeKMcuZlaS24v$fNRMdKtF8aGrKu56EIxLGzZOoGBV60Hc/S4UyY1gWFU=', 'sa2020', 'sa', 'ds', 'sa2020@gmail.com', '02485', 'ass', 'avatars/Batman_NFT.jpg', 'customer', 1, '2025-12-25 05:33:35.993405', NULL, '2026-01-06 09:15:16.620959'),
(3, 'pbkdf2_sha256$1000000$6xg06C3UThCuI9SYVTN0xK$KyULSKLa4XLWWAtXLZx7Usn5VVE5/I18lYPVp+vYeew=', 'seller', 'ss', 'dd', 'sa1234@gmail.com', '0987456123', 'ada', 'avatars/download.jpg', 'seller', 1, '2025-12-25 09:41:01.290523', NULL, '2026-01-05 02:17:18.204498'),
(4, 'pbkdf2_sha256$1000000$IdPu85B8e7Sp0FoCMths7P$cUKDkPE6sVI1mdojkQa8APL0lqyDtQnbIMg5qgQrIFQ=', 'test_auth_user', 'Test', 'User', 'test@example.com', '', NULL, '', 'new_user', 1, '2025-12-29 16:38:14.560832', NULL, '2025-12-29 16:38:14.752097'),
(5, 'pbkdf2_sha256$1000000$qGolOCyTkQ8YyaB0HmzI5Q$PT1E3OhCgdx7hqZ1vz9h8KDH0uhA1yiw3qkY9ug6EVQ=', 'sa2234', 'sa', '2234', 'sa2234@gmail.com', '08795464', NULL, '', 'new_user', 1, '2025-12-31 02:24:55.684430', NULL, '2025-12-31 02:24:55.958814'),
(6, 'pbkdf2_sha256$1000000$5L2dAnkbBDX6uEnZIrtTuI$VX6h39MErk+1Jmg7yBGkU6Y7njL5JKnKCTx2DGaBHks=', 'test_verify_user', '', '', 'test_verify@example.com', NULL, NULL, '', 'new_user', 1, '2026-01-05 04:32:00.638755', NULL, '2026-01-05 04:32:00.948144'),
(7, 'pbkdf2_sha256$1000000$Ct2Atyu2kHnvVpUxy7L0vl$u2OqxDqLsozu+c7X5Q301scvkzK4aYxFkPfTpwBZCC0=', 'testrunner', '', '', 'testrunner@example.com', NULL, NULL, '', 'new_user', 1, '2026-01-06 09:26:10.312142', NULL, '2026-01-06 09:28:32.139995'),
(8, 'pbkdf2_sha256$1000000$4tK2Xd9ZNQGIdmBcCFNCWj$f17sC5mmqQcCDWz4SVOAUiH3kG9M0DTxXDwCTn2y5Zk=', 'admin_check', '', '', 'admin@check.com', NULL, NULL, '', 'admin', 1, '2026-01-06 09:26:27.787205', NULL, '2026-01-06 09:26:28.086468');

-- --------------------------------------------------------

--
-- Table structure for table `users_groups`
--

CREATE TABLE `users_groups` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_user_permissions`
--

CREATE TABLE `users_user_permissions` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_logs_admin_id_f4e1f6a6_fk_users_id` (`admin_id`);

--
-- Indexes for table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_users_id` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indexes for table `myapp_review`
--
ALTER TABLE `myapp_review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_product_id_d4b78cfe_fk_products_id` (`product_id`),
  ADD KEY `reviews_user_id_c23b0903_fk_users_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_user_id_7e2523fb_fk_users_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_412ad78b_fk_orders_id` (`order_id`),
  ADD KEY `order_items_product_id_dd557d5a_fk_products_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_seller_id_76e92f9e_fk_users_id` (`seller_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_28ebf5f0_fk_products_id` (`product_id`);

--
-- Indexes for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_history_created_by_id_bcd2fa04_fk_users_id` (`created_by_id`),
  ADD KEY `stock_history_product_id_db9ee9ec_fk_products_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users_groups`
--
ALTER TABLE `users_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_groups_user_id_group_id_fc7788e8_uniq` (`user_id`,`group_id`),
  ADD KEY `users_groups_group_id_2f3517aa_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `users_user_permissions`
--
ALTER TABLE `users_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_user_permissions_user_id_permission_id_3b86cbdf_uniq` (`user_id`,`permission_id`),
  ADD KEY `users_user_permissio_permission_id_6d08dcd2_fk_auth_perm` (`permission_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
>>>>>>> origin/main

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `myapp_review`
--
ALTER TABLE `myapp_review`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=204;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=485;

--
-- AUTO_INCREMENT for table `stock_history`
--
ALTER TABLE `stock_history`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users_groups`
--
ALTER TABLE `users_groups`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_user_permissions`
--
ALTER TABLE `users_user_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_admin_id_f4e1f6a6_fk_users_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `myapp_review`
--
ALTER TABLE `myapp_review`
  ADD CONSTRAINT `reviews_product_id_d4b78cfe_fk_products_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `reviews_user_id_c23b0903_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_user_id_7e2523fb_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_412ad78b_fk_orders_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_product_id_dd557d5a_fk_products_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_seller_id_76e92f9e_fk_users_id` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_product_id_28ebf5f0_fk_products_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD CONSTRAINT `stock_history_created_by_id_bcd2fa04_fk_users_id` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `stock_history_product_id_db9ee9ec_fk_products_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `users_groups`
--
ALTER TABLE `users_groups`
  ADD CONSTRAINT `users_groups_group_id_2f3517aa_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `users_groups_user_id_f500bee5_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users_user_permissions`
--
ALTER TABLE `users_user_permissions`
  ADD CONSTRAINT `users_user_permissio_permission_id_6d08dcd2_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `users_user_permissions_user_id_92473840_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
--
-- Update for Seller Tracking form Agent
--

ALTER TABLE `products` 
ADD COLUMN `seller_id` bigint NULL DEFAULT NULL;

ALTER TABLE `products` 
ADD CONSTRAINT `fk_products_seller` 
FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) 
ON DELETE CASCADE;

-- Update ALL existing products to belong to Seller (ID 2) "of this one"
UPDATE `products` SET `seller_id` = 2;

-- Example Insert linking to Seller (User ID 2)
INSERT INTO `products` 
(`title`, `description`, `category`, `price`, `stock`, `brand`, `thumbnail`, `rating`, `is_active`, `created_at`, `updated_at`, `seller_id`) 
VALUES 
('สินค้าใหม่จาก Seller', 'เพิ่มผ่าน SQL โดยตรง', 'general', 500.00, 20, 'MyBrand', '', 0.00, 1, NOW(), NOW(), 2);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

