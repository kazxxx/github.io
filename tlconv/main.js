function main() {
    //正規表現の設定  0:00 or 00:00 にヒットする箇所を取得
    const regex = /\d{1,2}:\d{2}/g;
    
    //持ち越し時間を取得 (取得の際 全角->半角 変換)
    const getRemainingTime = toHalfWidth(document.getElementById("remainingTime").value);
    
    //新TLの書込先textareaを取得
    const outTextarea = document.getElementById("newTL");
    
    //持ち越し時間を 全角->半角 変換
    
    //持ち越し時間が不正の場合はエラーメッセージを出力して終了
    if (!getRemainingTime.match(regex) || getRemainingTime.length > 5) {
        outTextarea.value = "持越し時間は 0:00 の様式で入力して下さい";
        return;
    }
    
    //現TLを取得
    const currentTL = document.getElementById("currentTL").value;
    
    //現TLから時間取得＆文字位置を取得 [[time, index], ...]
    const matchResult = [...currentTL.matchAll(regex)].map(e => [e[0], e.index]);
    
    //マッチした数を取得
    const matchCount = matchResult.length

    //1件もマッチしなかった場合はエラーメッセージを出力して終了
    if (matchCount == 0) {
        outTextarea.value = "クリップボード上のテキストに時間の記述(0:00)が見つかりませんでした";
        return;
    }

    //新TLの格納先変数  初期値は最初の時間(0:00 or 00:00)が現れる前までの文字列を格納
    let newTL = currentTL.slice(0, matchResult[0][1]) + convMMSS(matchResult[0][0], getRemainingTime, matchResult[0][0].length);
    
    //新TL作成（2つ目以降の時間を置き換え）
    for (let i=1; i<matchCount; i++) {
        newTL += currentTL.slice(matchResult[i-1][1] + matchResult[i][0].length, matchResult[i][1]) + 
        convMMSS(matchResult[i][0], getRemainingTime, matchResult[i][0].length);
    }
    
    //最後の時間を置き換え
    newTL += currentTL.slice(matchResult[matchCount-1][1] + matchResult[matchCount-1][0].length);

    //textareaに表示＆縦幅調整
    outTextarea.value = newTL;
    outTextarea.style.height = "58px";
    outTextarea.style.height = `${outTextarea.scrollHeight}px`;
}

//本来のTLから差分時間を引いて新TLの時間を返す
function convMMSS(currentTime, remainingTime, strLength) {
    let arrayVar;

    arrayVar = currentTime.split(":").map(n => { return Number(n) });
    const currentSec = arrayVar[0] * 60 + arrayVar[1];

    arrayVar = remainingTime.split(":").map(n => {return Number(n) });
    const remainingSec = arrayVar[0] * 60 + arrayVar[1];

    const diffSec = 90 - remainingSec;
    const newSec = currentSec - diffSec;

    if (newSec < 1) {
        return "00:00".slice(-strLength);
    } else {
        return ("0" + Math.floor(newSec / 60) + ":" + ("0" + newSec % 60).slice(-2)).slice(-strLength);
    }
    
}

//英数字変換(全角 -> 半角)
function toHalfWidth(str) {
  // 全角英数字を半角に変換
  str = str.replace(/[Ａ-Ｚａ-ｚ０-９：]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  return str;
}