/*
SQLyog Ultimate v12.5.0 (64 bit)
MySQL - 8.0.13 : Database - 3dmodel
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`3dmodel` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `3dmodel`;

/*Table structure for table `scheme` */

DROP TABLE IF EXISTS `scheme`;

CREATE TABLE `scheme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `img` longtext,
  `data` text,
  `share_state` int(11) NOT NULL DEFAULT '0' COMMENT '0:不共享/1:共享/2:密码共享',
  `share_password` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

/*Data for the table `scheme` */

insert  into `scheme`(`id`,`uid`,`name`,`img`,`data`,`share_state`,`share_password`) values 
(22,1,'西装','data:image/jpeg;base64,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','{\"name\":\"西装\",\"components\":[{\"name\":\"测试\",\"models\":[{\"name\":\"整体\",\"fileId\":\"2464cf3d458ba86e9fc0ecf2b220bf0d\",\"modelObj\":null}],\"modelIndex\":0,\"textures\":[{\"name\":\"121-002.jpg\",\"fileId\":\"e0a76c2534db14c2418a73c11da36308\",\"textureObj\":null},{\"name\":\"21892-9003.jpg\",\"fileId\":\"9a253ef2b1cfdf5ea4338a716fdfc761\",\"textureObj\":null},{\"name\":\"KY-A-1.jpg\",\"fileId\":\"083d077348e24f50be3e7595a572aac4\",\"textureObj\":null},{\"name\":\"Shirt3-14-9.jpg\",\"fileId\":\"69b2001ef3a7ab8d61311759f316bd71\",\"textureObj\":null},{\"name\":\"Shirt3-14-10.jpg\",\"fileId\":\"36315d1ad69dffbbe3bd731189caff06\",\"textureObj\":null},{\"name\":\"Shirt3-14-6.jpg\",\"fileId\":\"2f84d05073d517cb31fa07bac2c4f26f\",\"textureObj\":null},{\"name\":\"Shirt3-14-7.jpg\",\"fileId\":\"7a5e4113e4455d340afc575f8acf9205\",\"textureObj\":null},{\"name\":\"Shirt3-14-10.jpg\",\"fileId\":\"4fbf23de907dac7f9a7ee2f0dd802cba\",\"textureObj\":null}],\"textureIndex\":4},{\"name\":\"配件\",\"models\":[{\"name\":\"KouDai2.1.FBX\",\"fileId\":\"fcf66c97b1dd612d09928c4735914feb\",\"modelObj\":null},{\"name\":\"KouDai2.FBX\",\"fileId\":\"8a83fa7a0035d304bdfff573c28c2c3f\",\"modelObj\":null},{\"name\":\"KouDai3.FBX\",\"fileId\":\"89dff4f75db48d263174124f90807b80\",\"modelObj\":null}],\"modelIndex\":2,\"textures\":[],\"textureIndex\":-1}],\"id\":\"22\",\"maxHeight\":10,\"height\":2.1,\"maxDistance\":30,\"distance\":7.2}',2,'123456');

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Data for the table `user` */

insert  into `user`(`id`,`account`,`password`,`name`) values 
(1,'tonkia','123456','TONKIA CPY');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
