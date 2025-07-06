from sqlalchemy.orm import Session
from app.repository.Data_Source_ACGN_Personal_Preference_Table_Generator import (
    get_Data_Source_ACGN_Personal_Preference_Table_Generator_by_ACGN_Personal_Preference_Table_Generator_ID,
    insert_Data_Source_ACGN_Personal_Preference_Table_Generator,
    check_Data_Source_ACGN_Personal_Preference_Table_Generator_Exist,
    insert_Data_Source_ACGN_Personal_Preference_Table_Generator,
    update_Data_Source_ACGN_Personal_Preference_Table_Generator

)


# 查询指定表ID的数据源
def list_data_source_by_generator_id(db: Session, id: int):
    return get_Data_Source_ACGN_Personal_Preference_Table_Generator_by_ACGN_Personal_Preference_Table_Generator_ID(db, id)





# 爬取指定 ACGN 个人喜好表生成器ID的数据源
# 这个方法应该在 service 层实现，负责具体的爬取逻辑
# 逻辑是，前端返回指定的 ACGN 个人喜好表生成器 ID，由controller层接收后，调用 service 层的爬取方法
# 现在实现service 层的爬取方法
# 爬取逻辑：依据ID从对应的官方网站爬取数据源
"""
  这里应该是一个映射：
  ID为————> 对应的官方网站链接
  1————>原神Genshin Impact
  2————>崩坏星穹铁道Honkai: Star Rail
  3————>绝区零ZenlessZoneZero

  暂时就定这三个，后面可能会继续添加

  爬取之后，要将其存入数据库中,此处需要将爬取的数据的对应字段进行提取，将其通过
  insert_Data_Source_ACGN_Personal_Preference_Table_Generator 方法存入数据库

  其中需要注意的是，爬取的网站的数据源中包含图片，此处我暂时不知道怎么处理
  1. 可以将图片存储在本地指定文件夹下面，然后将图片相对路径存入数据库
  2. 可以将图片存储在数据库中，作为BLOB类型存储
  这两个有什么区别呢？
# 1. 存储在本地文件夹中，图片可以直接访问，速度快，但需要额外的存储空间
# 2. 存储在数据库中，图片需要通过程序访问，速度慢
  数据库中的BLOB类型本质上是将二进制数据存储在数据库中，可以直接通过SQL语句访问，但会增加数据库的体积
# 目前我倾向于第一种方式，将图片存储在本地文件夹中，然后将图片相对路径存入数据库
  这样可以减少数据库的体积，同时也可以直接访问图片，速度更快





  1.原神:
  请求网址:米游社官网原神分区的角色图鉴的api
  https://act-api-takumi-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=25 
  请求方法:
  GET
  状态代码:
  200 OK
  远程地址:
  [2409:8c28:2808:5:3::3eb]:443
  引荐来源网址政策:
  strict-origin-when-cross-origin

  {
    "retcode": 0,
    "message": "OK",
    "data": {
        "list": [
            {
                "id": 25,
                "name": "角色",
                "parent_id": 189,
                "depth": 2,
                "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"3\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"collectionAvatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[{\\\"label\\\":\\\"地区\\\",\\\"children\\\":[{\\\"label\\\":\\\"蒙德城\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"璃月港\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"稻妻城\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"须弥城\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"枫丹廷\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"纳塔\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"未知\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"星级\\\",\\\"children\\\":[{\\\"label\\\":\\\"五星\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"四星\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"神之眼所属\\\",\\\"children\\\":[{\\\"label\\\":\\\"蒙德\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"璃月\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"稻妻\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"须弥\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"枫丹\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"愚人众\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"纳塔\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"未知\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"元素\\\",\\\"children\\\":[{\\\"label\\\":\\\"风\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"火\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"水\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"冰\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"雷\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"岩\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"草\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"武器\\\",\\\"children\\\":[{\\\"label\\\":\\\"单手剑\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"双手剑\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"弓\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"长柄武器\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"法器\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"始基力\\\",\\\"children\\\":[{\\\"label\\\":\\\"荒\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"芒\\\",\\\"children\\\":[]}]}]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"https://baike.mihoyo.com/ys/obc/channel/map/189/25?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"开放全量C端玩家可新建词条\",\"attribute_key\":\"open_for_create\",\"value\":\"0\"}]",
                "children": [],
                "list": [
                    {
                        "content_id": 505417,
                        "title": "丝柯克",
                        "ext": "{\"c_25\":{\"filter\":{\"text\":\"[\\\"地区/纳塔\\\",\\\"星级/五星\\\",\\\"神之眼所属/未知\\\",\\\"元素/冰\\\",\\\"武器/单手剑\\\"]\"}}}",
                        "icon": "https://act-upload.mihoyo.com/wiki-user-upload/2025/06/11/50494840/867b0b36bfd629cd5ce88443cc5816c6_4280221560184703515.png",
                        "bbs_url": "",
                        "article_user_name": "",
                        "article_time": "0",
                        "avatar_url": "",
                        "summary": "虚渊暗星 · 丝柯克",
                        "alias_name": "",
                        "corner_mark": "None"
                    },
                    {
                        "content_id": 3386,
                        "title": "申鹤",
                        "ext": "{\"c_25\":{\"filter\":{\"text\":\"[\\\"地区/璃月港\\\",\\\"星级/五星\\\",\\\"神之眼所属/璃月\\\",\\\"元素/冰\\\",\\\"武器/长柄武器\\\"]\"}}}",
                        "icon": "https://uploadstatic.mihoyo.com/ys-obc/2022/01/05/16314655/e2dfeee83654c0a6a7436b7c120c105a_6628180966971160404.png",
                        "bbs_url": "",
                        "article_user_name": "",
                        "article_time": "0",
                        "avatar_url": "",
                        "summary": "申鹤",
                        "alias_name": "",
                        "corner_mark": "None"
                    },
                    {
                        "content_id": 505418,
                        "title": "塔利雅",
                        "ext": "{\"c_25\":{\"filter\":{\"text\":\"[\\\"地区/蒙德城\\\",\\\"星级/四星\\\",\\\"神之眼所属/蒙德\\\",\\\"元素/水\\\",\\\"武器/单手剑\\\"]\"}}}",
                        "icon": "https://act-upload.mihoyo.com/wiki-user-upload/2025/06/11/50494840/9508cb49aeb8ab876dc013c5a7e08272_3046493633434450631.png",
                        "bbs_url": "",
                        "article_user_name": "",
                        "article_time": "0",
                        "avatar_url": "",
                        "summary": "颂礼祝祭 · 塔利雅",
                        "alias_name": "",
                        "corner_mark": "None"
                    },



  只列出一部分内容：需要提取的字段有：
                        "content_id": 505417,转换为Item_ID
                        "title": "丝柯克",转换为Item_Name
                        "icon": "https://act-upload.mihoyo.com/wiki-user-upload/2025/06/11/50494840/867b0b36bfd629cd5ce88443cc5816c6_4280221560184703515.png",转换为Item_Picture

                        除此之外还有两个字段Data_Source_ACGN_Personal_Preference_Table_Generator_ID和ACGN_Personal_Preference_Table_Generator_ID，后者为外键，这里是原神的数据源，所以默认为1
                        前者是表的自增主键ID，应该不需要处理。


                        流程步骤：
                        1. 爬取数据源，获取上述字段
                        2.先依据content_id判断数据库中是否存在该条记录，如果存在则执行更新覆盖，如果不存在则新增插入，此条涉及到的函数为check_Data_Source_ACGN_Personal_Preference_Table_Generator_Exist和insert_Data_Source_ACGN_Personal_Preference_Table_Generator和update_Data_Source_ACGN_Personal_Preference_Table_Generator

                        执行更新覆盖：针对每条数据，将其中的图片下载到本地，覆盖掉原本存在的图片，命名和原本存在的图片一样。
                        执行新增插入，针对每条数据，将其中的图片下载到本地，命名为content_id.png，存储在指定的文件夹中，然后将图片相对路径存入数据库中。

                        
2. 崩坏星穹铁道:
  请求网址:崩坏星穹铁道官网角色图鉴的api
  请求网址:
  https://act-api-takumi-static.mihoyo.com/common/blackboard/sr_wiki/v1/home/content/list?app_sn=sr_wiki&channel_id=17
  请求方法:
  GET
  状态代码:
  200 OK （来自磁盘缓存）
  远程地址:
  [2409:8c28:2808:5:3::3ea]:443
  引荐来源网址政策:
  strict-origin-when-cross-origin

  {
    "retcode": 0,
    "message": "OK",
    "data": {
        "list": [
            {
                "id": 9,
                "name": "快捷导航",
                "parent_id": 0,
                "depth": 1,
                "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"4\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"kingkong16\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/23/288909604/19f8d946ec0c9e85d6efce68f8765bbf_6961463201971376657.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"}]",
                "children": [
                    {
                        "id": 16,
                        "name": "攻略合集",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"card\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/07/19/279865110/b91ec15000a0a375ffd43c80765a30bd_4549476199837866030.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/content/5606/detail?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2025/06/30/283462834/5b6f2e255989a0885e1c2134f15ddb6a_2023141555326645380.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2025/06/30/283462834/a3f124b5c5e3fc5c2fa868f661b179d5_6119570000728453116.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 194,
                        "name": "黄金裔WIKI",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"card\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2025/04/18/283462834/eb9b3d28b7623aabc27de9a713dd06b1_1703348510770950516.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://act.mihoyo.com/sr/event/gt-aio/chrysos-heirs/index.html?mhy_presentation_style=fullscreen\\u0026mhy_landscape=true\\u0026mhy_hide_status_bar=true\\u0026utm_source=bbs\\u0026utm_medium=mys\\u0026utm_campaign=wiki\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2025/04/18/283462834/68f6516195556fdc23d8c975980fc3fa_314621274072977534.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2025/04/18/283462834/f3b26ee5f59b9f76e28ce7bf34a920cd_8532118897866747829.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 12,
                        "name": "萌新指南",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"collectionAvatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2024/01/17/279865110/309646beeab72fcb764c06187443ff82_7283839332794332870.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/content/692/detail?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2024/01/17/279865110/6634004fffa72224d39d58aece4082ce_696447156801552430.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2024/01/17/279865110/8e58d6ea24ff29e5aa11514cad713490_4462544259949352381.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 13,
                        "name": "地图工具",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/fa624ca3841fcdb73f1bf7e525f5984a_1046900500905846473.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://webstatic.mihoyo.com/sr/app/interactive-map/index.html?bbs_presentation_style=no_header%2Fmap%2F38\\u0026utm_source=bbs\\u0026utm_medium=mys\\u0026utm_campaign=icon\\u0026lang=zh-cn#/map/38?shown_types=49,2,3,4,5,6,7,8,9,10,11,12,134,135,195,196,24,306,321,439,440,230\\u0026center=101.13,3.04\\u0026zoom=0.00\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/7185cf17c963319291767c4e289c77e7_3404413583527427565.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/94d42f807663e49b9a776a934fe50f1d_525818271802410569.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 56,
                        "name": "活动合集",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/07/21/279865110/1ea7c320479b71ef754efe2638136e52_3719171213094882620.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/content/1257/detail?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/11/06/279865110/1e156730da954b9f6280a7a7196028ff_6406493958357758700.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/11/06/279865110/f4b59a35ff8e4366c9b808e2f3492e1c_2302094986113141206.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 10,
                        "name": "角色一览",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"collectionAvatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/eb7c80e9dfc503a24c281be6a89ab013_779574104987902327.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/channel/map/17/18?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/bbc721911e1fa3d22c0914a2ca54b5e4_5136155939667884190.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/088c02a5d1aabf9481a17f46127a42ba_6105645447867970142.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 11,
                        "name": "光锥一览",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"collectionAvatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/8791ff6f87a1c137be0af318abb9d4aa_3700835824542392092.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/channel/map/17/19?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/2559cd9e1db9428f33ac942d5671c6bd_5014309058974199861.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/b568c8d3211eb34cd64d488a1f60ac78_7802121418864706279.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 29,
                        "name": "遗器一览",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"collectionAvatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/2e26011af9032d72b665a2f90cc483f0_4601761747747010855.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/channel/map/17/30?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/5f23a09438e905500b247cda8cc8de7b_8886283651131153151.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2025/04/18/283462834/46241d91d0bd8dd8a02159fd0f299a96_7761735253476176184.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": true
                    },
                    {
                        "id": 14,
                        "name": "敌对物种",
                        "parent_id": 9,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"2\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"collectionAvatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/efc405ac1839b2f0cf0a0e5568d2a78a_2407769840691232900.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://bbs.mihoyo.com/sr/wiki/channel/map/17/23?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/57e139602f0daa584c2e8634d1d10471_6245113869410825829.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/21/288909604/1fd0ade2496fba03d9911bf87345deff_46009306500377187.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    }
                ],
                "list": [],
                "layout": "",
                "entry_limit": 0,
                "hidden": false
            },
            {
                "id": 17,
                "name": "游戏图鉴",
                "parent_id": 0,
                "depth": 1,
                "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"3\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"filter\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/sr-wiki/2023/04/23/288909604/19f8d946ec0c9e85d6efce68f8765bbf_3995531572424969981.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"}]",
                "children": [
                    {
                        "id": 18,
                        "name": "角色",
                        "parent_id": 17,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"4\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"largeModelCard\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[{\\\"label\\\":\\\"属性\\\",\\\"children\\\":[{\\\"label\\\":\\\"物理\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"火\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"冰\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"雷\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"风\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"量子\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"虚数\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"命途\\\",\\\"children\\\":[{\\\"label\\\":\\\"毁灭\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"巡猎\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"智识\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"同谐\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"虚无\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"存护\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"丰饶\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"记忆\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"星级\\\",\\\"children\\\":[{\\\"label\\\":\\\"五星\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"四星\\\",\\\"children\\\":[]}]}]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"/sr/wiki/channel/map/17/18?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"0\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"}]",
                        "children": [],
                        "list": [
                            {
                                "content_id": 5107,
                                "title": "白厄",
                                "ext": "{\"c_18\":{\"filter\":{\"text\":\"[\\\"属性/物理\\\",\\\"命途/毁灭\\\",\\\"星级/五星\\\"]\"},\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/07/02/276833758/bc8e3cc7d9d284c9dc1bf11b5438e85e_405039117997966432.png\"]}},\"c_186\":{\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/05/21/193706962/d3502974c3bc5b324895be330033a35f_1103689339131499055.png\"]}},\"c_193\":{\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/04/16/193706962/507a611589f5ccaea4a644d72fe0ba83_4997973163897504188.jpg\"]}}}",
                                "icon": "https://act-upload.mihoyo.com/sr-wiki/2025/05/06/276833758/e48a2c7ae4584cf2b756d0dff22d11cb_4717597785590128606.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "角色-白厄",
                                "alias_name": "",
                                "corner_mark": "None"
                            },
                            {
                                "content_id": 4608,
                                "title": "缇宝",
                                "ext": "{\"c_18\":{\"filter\":{\"text\":\"[\\\"星级/五星\\\",\\\"命途/同谐\\\",\\\"属性/量子\\\"]\"},\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/07/02/276833758/64f23f9b166837251fca180a1dc9bf40_835385752857382543.png\"]}},\"c_186\":{\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/04/14/193706962/210d8623d9ca109e0122463ce7a74b8f_5524949414207044132.png\"]}},\"c_193\":{\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/04/16/193706962/04706d55b1fdf7b92e13e92ffb0032af_5399260752938354747.jpg\"]}}}",
                                "icon": "https://act-upload.mihoyo.com/sr-wiki/2024/12/28/75216984/49c09d0caa78fc5229cbdf05437a0ea4_3878174941507799217.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "角色-缇宝",
                                "alias_name": "",
                                "corner_mark": "None"
                            },
                            {
                                "content_id": 4174,
                                "title": "星期日",
                                "ext": "{\"c_18\":{\"filter\":{\"text\":\"[\\\"星级/五星\\\",\\\"命途/同谐\\\",\\\"属性/虚数\\\"]\"},\"picture\":{\"list\":[\"https://act-upload.mihoyo.com/sr-wiki/2025/07/02/276833758/f7bcdfd12c42cedc29cd0cc0c264bc78_1748554382694883023.png\"]}}}",
                                "icon": "https://act-upload.mihoyo.com/sr-wiki/2024/10/08/279865110/a1b097295b25c8feaa540d7439db449c_1488577577224394022.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "角色-星期日",
                                "alias_name": "",
                                "corner_mark": "None"
                            },

    只列出一部分内容：需要提取的字段有：
                            "content_id": 4174,转换为Item_ID
                            "title": "星期日",转换为Item_Name
                            "icon": "https://act-upload.mihoyo.com/sr-wiki/2024/10/08/279865110/a1b097295b25c8feaa540d7439db449c_1488577577224394022.png",转换为Item_Picture

                            除此之外还有两个字段Data_Source_ACGN_Personal_Preference_Table_Generator_ID和ACGN_Personal_Preference_Table_Generator_ID，后者为外键，这里是崩坏星穹铁道的数据源，所以默认为2
                            前者是表的自增主键ID，应该不需要处理。

                            其余步骤跟原神的方案一致


3. 绝区零
  请求网址:绝区零官网角色图鉴的api
  请求网址:
  https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/home/content/list?app_sn=zzz_wiki&channel_id=2
  请求方法:
  GET
  状态代码:
  200 OK （来自磁盘缓存）
  远程地址:
  [2409:8c28:2808:5:3::3ea]:443
  引荐来源网址政策:
  strict-origin-when-cross-origin

  {
    "retcode": 0,
    "message": "OK",
    "data": {
        "list": [
            {
                "id": 64,
                "name": "快捷导航",
                "parent_id": 0,
                "depth": 1,
                "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"kingkong16\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                "children": [
                    {
                        "id": 77,
                        "name": "代理人",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/1e8d488828fed5c9caba7eb393d18a52_4960650170891222160.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/43\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/1e8d488828fed5c9caba7eb393d18a52_4588078170030823167.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/1e8d488828fed5c9caba7eb393d18a52_2997407445661158531.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 79,
                        "name": "音擎",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/3593482e8866f0529e8a247772e02cf4_9000998857010418579.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/45\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/3593482e8866f0529e8a247772e02cf4_5418014644502214835.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/3593482e8866f0529e8a247772e02cf4_349805249158769789.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 78,
                        "name": "邦布",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/0ce86ee140a04fd833f948a637af2283_6032912694898607598.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/44\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/0ce86ee140a04fd833f948a637af2283_1513181873101011224.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/0ce86ee140a04fd833f948a637af2283_5874175819704224877.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 83,
                        "name": "驱动盘",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/222103265483a5389ab8e589a81b8f29_631255302098390130.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/46\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/222103265483a5389ab8e589a81b8f29_6239774837764585524.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/222103265483a5389ab8e589a81b8f29_8551770508031023629.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 85,
                        "name": "攻略合集",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/b848977173910bd7f1029f89003dff75_5029146239094517815.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/content/1358/detail?mhy_presentation_style=fullscreen\\u0026visit_device=mobile\\u0026show_back_home=true\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/b848977173910bd7f1029f89003dff75_3952281026289371623.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/b848977173910bd7f1029f89003dff75_5527309938016632848.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 82,
                        "name": "地图收集",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/89cb7e0fb8ef815d67758aab26f43c3f_3098073846776448996.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/97?mhy_presentation_style=fullscreen\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/89cb7e0fb8ef815d67758aab26f43c3f_6477975571440283013.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/89cb7e0fb8ef815d67758aab26f43c3f_7128413789162572327.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 88,
                        "name": "壁纸收录",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/8bfba74e257162078b8891231cd8725b_7605676739324472980.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/13/98?mhy_presentation_style=fullscreen\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/8bfba74e257162078b8891231cd8725b_1501566716828803743.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/8bfba74e257162078b8891231cd8725b_8094377281202453448.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 84,
                        "name": "空洞见闻",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/b61294cb18cd1fd562ffe2a0c6f0642e_9157629997581347950.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/6/7\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/b61294cb18cd1fd562ffe2a0c6f0642e_536792962072159478.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/b61294cb18cd1fd562ffe2a0c6f0642e_6905885262483965723.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [
                            {
                                "content_id": 1258,
                                "title": "武备图鉴",
                                "ext": "{}",
                                "icon": "https://act-upload.mihoyo.com/nap-obc-indep/2024/12/18/76099754/a8f1c0bc224ea68a0cd33c6aa219cb4f_1690338145283087434.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "武备图鉴,迷失之地,迷失之地图鉴,迷失之地武备,绝区零代理人变招,绝区零模拟宇宙,绝区零肉鸽,绝区零随机挑战,迷失之地BUFF,绳网情报站,绝区零图鉴,绝区零委托图鉴,绝区零百科",
                                "alias_name": "武备图鉴",
                                "corner_mark": "None"
                            }
                        ],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 81,
                        "name": "敌人",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/39e69fa36571347e9300cb88dedea782_3077637731444238066.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/65\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/39e69fa36571347e9300cb88dedea782_5990935446758869519.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/39e69fa36571347e9300cb88dedea782_6974943392963853090.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 80,
                        "name": "材料",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/e678069fecc024eb2cc6b98e117d1db0_8984761505914864079.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/2/47\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/e678069fecc024eb2cc6b98e117d1db0_7466294125296958247.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/e678069fecc024eb2cc6b98e117d1db0_2907432069467262965.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 87,
                        "name": "活动攻略",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/64c9aca07027becd6143bbbdb47a323a_7101530280814421084.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/66/71?mhy_presentation_style=fullscreen\\u0026from=COLLECTION_BG\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/64c9aca07027becd6143bbbdb47a323a_7089473772145220523.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/64c9aca07027becd6143bbbdb47a323a_7123909378889791890.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    },
                    {
                        "id": 86,
                        "name": "萌新指南",
                        "parent_id": 64,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"default\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/bea3817b256eee171af6f8f825df6038_1305086487345515437.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"https://baike.mihoyo.com/zzz/wiki/channel/map/66/70\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/bea3817b256eee171af6f8f825df6038_6206654890698652988.png\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/bea3817b256eee171af6f8f825df6038_1121334861579903663.png\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [],
                        "layout": "",
                        "entry_limit": 0,
                        "hidden": false
                    }
                ],
                "list": [],
                "layout": "",
                "entry_limit": 0,
                "hidden": false
            },
            {
                "id": 117,
                "name": "更新日志精选",
                "parent_id": 0,
                "depth": 1,
                "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"eliteUpdates\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"/zzz/wiki/channel/map/2?mhy_presentation_style=fullscreen\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                "children": [],
                "list": [],
                "layout": "",
                "entry_limit": 0,
                "hidden": false
            },
            {
                "id": 2,
                "name": "游戏图鉴",
                "parent_id": 0,
                "depth": 1,
                "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"filter\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/05/14/76099754/ebf86ad48aa7007cbb5642efcce81cbf_4612838929724013352.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[{\\\"label\\\":\\\"阵容选择\\\",\\\"children\\\":[{\\\"label\\\":\\\"狡兔屋\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"白祇重工\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"维多利亚家政\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"对空洞特别行动部六科\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"奥波勒斯小队\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"新艾利都治安局\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"特性选择\\\",\\\"children\\\":[{\\\"label\\\":\\\"强攻\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"击破\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"异常\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"支援\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"防护\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"属性选择\\\",\\\"children\\\":[{\\\"label\\\":\\\"物理属性\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"以太属性\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"电属性\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"冰属性\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"火属性\\\",\\\"children\\\":[]}]}]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"/zzz/wiki/channel/map/2?bbs_presentation_style=no_header\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                "children": [
                    {
                        "id": 43,
                        "name": "代理人",
                        "parent_id": 2,
                        "depth": 2,
                        "ch_ext": "[{\"type\":\"text\",\"attribute_name\":\"每行个数\",\"attribute_key\":\"col_per_row\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"展示样式\",\"attribute_key\":\"display_type\",\"value\":\"avatar\"},{\"type\":\"text\",\"attribute_name\":\"频道icon\",\"attribute_key\":\"icon_url\",\"value\":\"https://act-upload.mihoyo.com/nap-obc-indep/2024/06/01/76099754/1e8d488828fed5c9caba7eb393d18a52_7714098887489724504.png\"},{\"type\":\"text\",\"attribute_name\":\"跳转链接\",\"attribute_key\":\"jump_url\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc\",\"attribute_key\":\"icon_url_pc\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道icon-pc-hover\",\"attribute_key\":\"icon_url_pc_hover\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"筛选器\",\"attribute_key\":\"filter\",\"value\":\"[{\\\"label\\\":\\\"稀有度\\\",\\\"children\\\":[{\\\"label\\\":\\\"S\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"A\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"属性\\\",\\\"children\\\":[{\\\"label\\\":\\\"电\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"火\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"冰\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"以太\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"烈霜\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"物理\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"玄墨\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"特性\\\",\\\"children\\\":[{\\\"label\\\":\\\"异常\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"强攻\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"防护\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"击破\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"支援\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"命破\\\",\\\"children\\\":[]}]},{\\\"label\\\":\\\"阵营\\\",\\\"children\\\":[{\\\"label\\\":\\\"狡兔屋\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"刑侦特勤组\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"H.S.O.S.6\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"白祇重工\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"维多利亚家政\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"卡吕冬之子\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"天琴座\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"奥波勒斯小队\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"防卫军·白银小队\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"反舌鸟\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"云岿山\\\",\\\"children\\\":[]},{\\\"label\\\":\\\"怪啖屋\\\",\\\"children\\\":[]}]}]\"},{\"type\":\"text\",\"attribute_name\":\"首页更多\",\"attribute_key\":\"home_more\",\"value\":\"/zzz/wiki/channel/map/2/43?mhy_presentation_style=fullscreen\"},{\"type\":\"text\",\"attribute_name\":\"在目录中展示\",\"attribute_key\":\"show_in_catalog\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"最新词条\",\"attribute_key\":\"is_latest\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"更多入口icon\",\"attribute_key\":\"king_kong_icon\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"首页更多文案\",\"attribute_key\":\"home_more_text\",\"value\":\"\"},{\"type\":\"text\",\"attribute_name\":\"频道底图\",\"attribute_key\":\"channel_bg\",\"value\":\"\"}]",
                        "children": [],
                        "list": [
                            {
                                "content_id": 1301,
                                "title": "橘福福",
                                "ext": "{\"c_43\":{\"filter\":{\"text\":\"[\\\"稀有度/S\\\",\\\"属性/火\\\",\\\"特性/击破\\\",\\\"阵营/云岿山\\\"]\"}}}",
                                "icon": "https://act-upload.mihoyo.com/nap-obc-indep/2025/06/11/158441880/27d747ee1c225cb739aeff92465972c4_5361421654416153803.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "橘福福,绝区零橘福福,绝区零代理人图鉴,2.0,绳网情报站,绝区零图鉴,绝区零百科\n橘福福,橘福福技能,橘福福驱动盘,橘福福图鉴,橘福福影画,橘福福壁纸,橘福福数值,橘福福养成,橘福福配队,橘福福配对,橘福福素材,橘福福培养,橘福福好感,橘福福介绍,绝区零橘福福,绝区零代理人图鉴,绝区零火属性代理人,绝区零S级代理人,绝区零五星,击破,火属性,配队,配对,2.0,绳网情报站,绝区零图鉴,绝区零百科",
                                "alias_name": "",
                                "corner_mark": "None"
                            },
                            {
                                "content_id": 1299,
                                "title": "仪玄",
                                "ext": "{\"c_43\":{\"filter\":{\"text\":\"[\\\"稀有度/S\\\",\\\"属性/玄墨\\\",\\\"特性/命破\\\",\\\"阵营/云岿山\\\"]\"}}}",
                                "icon": "https://act-upload.mihoyo.com/nap-obc-indep/2025/06/04/76099754/0e23c7bada797f49d626181c8d3e169c_2545105937304446730.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "仪玄,仪玄技能,仪玄驱动盘,仪玄图鉴,仪玄影画,仪玄壁纸,仪玄数值,仪玄养成,仪玄配队,仪玄配对,仪玄素材,仪玄培养,仪玄好感,仪玄介绍,绝区零仪玄,绝区零代理人图鉴,绝区零玄墨属性代理人,绝区零S级代理人,绝区零五星,玄墨命破,命破,以太,配队,配对,2.0,绳网情报站,绝区零图鉴,绝区零百科",
                                "alias_name": "",
                                "corner_mark": "None"
                            },
                            {
                                "content_id": 1300,
                                "title": "潘引壶",
                                "ext": "{\"c_43\":{\"filter\":{\"text\":\"[\\\"稀有度/A\\\",\\\"属性/物理\\\",\\\"特性/防护\\\",\\\"阵营/云岿山\\\"]\"}}}",
                                "icon": "https://act-upload.mihoyo.com/nap-obc-indep/2025/04/26/73751405/7151eee6ba7f9ad07176f604b37a8799_4441778457614666765.png",
                                "bbs_url": "",
                                "article_user_name": "",
                                "article_time": "0",
                                "avatar_url": "",
                                "summary": "潘引壶,潘引壶技能,潘引壶驱动盘,潘引壶图鉴,潘引壶影画,潘引壶壁纸,潘引壶数值,潘引壶养成,潘引壶配队,潘引壶配对,潘引壶素材,潘引壶培养,潘引壶壁纸,潘引壶好感,潘引壶介绍,绝区零潘引壶,绝区零代理人图鉴,绝区零物理属性代理人,绝区零A级代理人,绝区零四星,震元奇枢,防护,配队,配对,2.0,绳网情报站,绝区零图鉴,绝区零百科",
                                "alias_name": "潘引壶",
                                "corner_mark": "None"
                            },


只列出一部分内容：需要提取的字段有：
                            "content_id": 1301,转换为Item_ID
                           "title": "橘福福",转换为Item_Name
                            "icon": "https://act-upload.mihoyo.com/nap-obc-indep/2025/06/11/158441880/27d747ee1c225cb739aeff92465972c4_5361421654416153803.png",转换为Item_Picture

                            除此之外还有两个字段Data_Source_ACGN_Personal_Preference_Table_Generator_ID和ACGN_Personal_Preference_Table_Generator_ID，后者为外键，这里是绝区零的数据源，所以默认为3
                            前者是表的自增主键ID，应该不需要处理。

                            其余步骤跟原神的方案一致




                            



                            


                            
综上。数据源中的本地图片存储路径为：


原神：resources/GenshinImpact文件夹
崩坏星穹铁道：resources/HonkaiStarRail文件夹
绝区零：resources/ZenlessZoneZero文件夹


"""

# 实现爬取指定ID数据源并入库的函数，保留原有注释不变。
def fetch_data_source_by_generator_id(db: Session, id: int) -> dict:
    import requests
    import os

    id_url_map = {
        1: "https://act-api-takumi-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=25",  # 原神
        2: "https://act-api-takumi-static.mihoyo.com/common/blackboard/sr_wiki/v1/home/content/list?app_sn=sr_wiki&channel_id=17",  # 崩坏星穹铁道
        3: "https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/home/content/list?app_sn=zzz_wiki&channel_id=2"  # 绝区零
    }
    img_dir_map = {
        1: os.path.join("resources", "GenshinImpact"),
        2: os.path.join("resources", "HonkaiStarRail"),
        3: os.path.join("resources", "ZenlessZoneZero")
    }
    url = id_url_map.get(id)
    img_dir = img_dir_map.get(id)
    if not url or not img_dir:
        return {"success": False, "msg": f"未知ID: {id}"}

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        return {"success": False, "msg": f"爬取失败: {str(e)}"}

    char_list = []
    if id == 1:
        # 原神：data.list[0].list
        big_list = data.get("data", {}).get("list", [])
        for group in big_list:
            for item in group.get("list", []):
                char_list.append(item)
    elif id == 2:
        # 崩坏星穹铁道：data.list -> 找到name为"游戏图鉴"的children，name为"角色"的list
        big_list = data.get("data", {}).get("list", [])
        for group in big_list:
            if group.get("name") == "游戏图鉴":
                for child in group.get("children", []):
                    if child.get("name") == "角色":
                        char_list.extend(child.get("list", []))
    elif id == 3:
        # 绝区零：data.list -> 找到name为"游戏图鉴"的children，name为"代理人"的list
        big_list = data.get("data", {}).get("list", [])
        for group in big_list:
            if group.get("name") == "游戏图鉴":
                for child in group.get("children", []):
                    if child.get("name") == "代理人":
                        char_list.extend(child.get("list", []))

    inserted, updated = 0, 0
    os.makedirs(img_dir, exist_ok=True)
    for item in char_list:
        item_id = item.get("content_id")
        item_name = item.get("title")
        img_url = item.get("icon")
        if img_url and item_id:
            img_filename = f"{item_id}.png"
            img_path = os.path.join(img_dir, img_filename)
            try:
                img_resp = requests.get(img_url, timeout=10)
                with open(img_path, "wb") as f:
                    f.write(img_resp.content)
                item_picture = img_path.replace("\\", "/")
            except Exception:
                item_picture = ""
        else:
            item_picture = ""
        if check_Data_Source_ACGN_Personal_Preference_Table_Generator_Exist(db, id, item_id):
            update_Data_Source_ACGN_Personal_Preference_Table_Generator(db, id, item_id, {
                "Item_Picture": item_picture,
                "Item_Name": item_name
            })
            updated += 1
        else:
            insert_Data_Source_ACGN_Personal_Preference_Table_Generator(db, {
                "ACGN_Personal_Preference_Table_Generator_ID": id,
                "Item_Picture": item_picture,
                "Item_Name": item_name,
                "Item_ID": item_id
            })
            inserted += 1
    return {
        "success": True,
        "inserted": inserted,
        "updated": updated,
        "msg": "爬取并入库完成"
    }

