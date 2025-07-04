import request from '@/utils/request' // 请求工具




// ===================== 统一表输出字段定义 =====================
export interface PreferenceTable{
  /** 所属表id */
  tableId: number;
  /** 名称 */
  name: string;
  /** 主要内容 */
  mainContent: string;
  /** 数据源中数据的数量 */
  number: number;
}




// ===================== 统一数据源输出字段定义 =====================
export interface PreferenceTableItem {
  /** 所属表id */
  tableId: number;
  /** 唯一标识id */
  id: number;
  /** 名称 */
  name: string;
  /** 图片url */
  image: string;
}





/**
 * 获取所有生成器表数据
 * GET /ACGN_Personal_Preference_Table_Generator/
 * @returns Promise<PreferenceTable[]>
 */
export async function fetchAllPreferenceTables(): Promise<PreferenceTable[]> {
  const res = await request.get('/ACGN_Personal_Preference_Table_Generator/all')
  // 假设后端返回数组，字段与PreferenceTable一致，否则需转换
  return res.data as PreferenceTable[]
}




//从后端获取表的数据源，并转换为统一数据源输出字段