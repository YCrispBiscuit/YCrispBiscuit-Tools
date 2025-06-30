// 此页面为纯前端实现的个人喜好表的数据字段
// 包含第三方API中字段获取和前端转换存储

// ===================== 统一输出字段定义 =====================
export interface PreferenceTableItem {
  /** 所属表id */
  tableId: string;
  /** 唯一标识id */
  id: string | number;
  /** 名称 */
  name: string;
  /** 图片url */
  image: string;
}

//统一输出字段定义
//所用字段有：
//1.所属表是哪个表，这里应该用表的id来标识
//2.唯一标识id
//3.名称
//4.图片



//各表字段获取+转换
//从各个第三方获取的API中的json字段都不太统一，从这里获取后进行转换，转换为“统一输出字段”



// 表一：原神Genshin_Impact

/**
 * 原神API返回的角色数据list转换为统一输出字段
 * @param apiList 原神API返回的data.list[0].list
 */
export function convertGenshinApiList(apiList: any[]): PreferenceTableItem[] {
  return apiList.map(item => ({
    tableId: 'genshin_impact',
    id: item.content_id,
    name: item.title,
    image: item.icon,
  }));
}

// ===================== 原神角色API前端爬取与转换 =====================

/**
 * 纯前端获取原神角色数据
 * 返回统一输出字段数组
 * 并在控制台输出原始API数据和转换后的数据
 */
export async function fetchAndConvertGenshinCharacters(): Promise<PreferenceTableItem[]> {
  const res = await fetch(
    'https://act-api-takumi-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=25',
    {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'origin': 'https://baike.mihoyo.com',
        'referer': 'https://baike.mihoyo.com/',
      }
    }
  );
  const json = await res.json();
  const apiList = json?.data?.list?.[0]?.list || [];
  console.log('原神API原始数据', apiList);
  const converted = convertGenshinApiList(apiList);
  console.log('转换后的统一输出字段', converted);
  return converted;
}

// ===================== 原神角色类型定义 =====================
/**
 * 原神个人喜好表类型（可自定义扩展）
 */
export const genshinPreferenceTypes = [
  '最喜欢的',
  '最讨厌的',
  '最常用的',
  '最想抽到的',
  '最冷门的',
  '最强的',
  '最弱的',
  '最可爱的',
  '最帅的',
  '最治愈的',
  '最烂的',
  '最喜欢的武器',
  '最喜欢的武器图标',
  '最喜欢的武器图标url',
  '最喜欢的武器攻击力',
  '最喜欢的武器攻击力（数值）',
  '最喜欢的武器攻击力（百分比）',
  '最喜欢的武器防御力',
  '最喜欢的武器防御力（数值）',
  '最喜欢的武器防御力（百分比）',
  '最喜欢的武器暴击率',
  '最喜欢的武器暴击率（数值）',
  '最喜欢的武器暴击率（百分比）',
  '最喜欢的武器暴击伤害',
  '最喜欢的武器暴击伤害（数值）',
  '最喜欢的武器暴击伤害（百分比）',
  '最喜欢的武器元素精通',

  // ...可继续扩展
];

/**
 * 单个格子的选择数据结构
 */
export interface GenshinPreferenceCell {
  type: string; // 类型（如“最喜欢的”）
  character?: PreferenceTableItem; // 选中的角色，可为空
}

/**
 * 生成初始的格子数据（每种类型一个格子，初始为空）
 */
export function getDefaultGenshinPreferenceGrid(): GenshinPreferenceCell[] {
  return genshinPreferenceTypes.map(type => ({ type, character: undefined }));
}

// 表二：绝区零Zenless_zone_zero
// 表三：崩坏：星穹铁道Honkai_Star_Rail
// 表四：动漫喜好表



