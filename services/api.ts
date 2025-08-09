import { User, ShiftWithDetails } from '../types.js';

// --- バックエンドAPIのベースURL ---
const BASE_URL = '/api';

/**
 * fetchをラップし、エラーハンドリングを共通化するヘルパー関数
 * @param url リクエスト先のURL (BASE_URL以降)
 * @returns 成功した場合はJSONデータ、失敗した場合は例外をスロー
 */
async function request<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`);
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API request failed with status ${res.status}: ${errorBody}`);
  }
  // レスポンスが空の場合も考慮
  if (res.headers.get('content-length') === '0') {
    return null as T;
  }
  return res.json();
}


export const api = {
  // ログイン機能は一旦モックのまま（将来的にはDB問い合わせに）
  login: (employeeCode: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      // 本来はPOSTリクエストでサーバーに認証を問い合わせる
      if (employeeCode === '12345' && password === 'password') {
        resolve({ id: 1, name: 'テストユーザー', employeeCode: '12345' });
      } else {
        reject(new Error('社員コードまたはパスワードが正しくありません。'));
      }
    });
  },

  /**
   * 特定のユーザーの、指定された年月のシフト一覧を取得する
   * @param userId ユーザーID
   * @param year 年 (例: 2025)
   * @param month 月 (1-12)
   */
  getShiftsForMonth: (userId: number, year: number, month: number): Promise<ShiftWithDetails[]> => {
    // 以前作成したAPIエンドポイントを呼び出す
    return request(`/shifts/${userId}/${year}/${month}`);
  },

  /**
   * 特定のユーザーの、指定された日付のシフトを取得する
   * @param userId ユーザーID
   * @param date 日付オブジェクト
   */
  getShiftForDate: (userId: number, date: Date): Promise<ShiftWithDetails | null> => {
    // 日付を 'YYYY-MM-DD' 形式の文字列に変換
    const dateString = date.toISOString().split('T')[0];
    // 以前作成したAPIエンドポイントを呼び出す
    return request(`/shifts/${userId}/${dateString}`);
  },
};