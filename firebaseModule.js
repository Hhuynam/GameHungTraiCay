// firebaseModule.js
const FIREBASE_DB_URL = "https://gamehungtraicay-d301f-default-rtdb.asia-southeast1.firebasedatabase.app";
//Hàm lưu điểm (POST)
export function saveScore(name, score) {
  console.log("Đang gửi điểm lên Firebase:", name, score);
  return fetch(`${FIREBASE_DB_URL}/scores.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      score: score,
      time: Date.now()
    })
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Gửi thành công:", data);
    })
    .catch((err) => {
      console.error("Lỗi khi gửi điểm:", err);
    });
}
// Hàm lấy top 5 điểm cao (GET + sắp xếp)
export async function getTopScores() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/scores.json`);
    const data = await response.json();
    if (!data) return [];

    const allScores = Object.values(data);
    allScores.sort((a, b) => b.score - a.score);

    return allScores.slice(0, 5);
  } catch (err) {
    console.error("Lỗi khi lấy bảng xếp hạng:", err);
    return [];
  }
}