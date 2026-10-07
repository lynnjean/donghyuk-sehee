/* =========================================================
   강동혁 ♥ 김세희 모바일 청첩장 — 방명록 Apps Script
   - 구글 시트 > 확장 프로그램 > Apps Script 에 붙여넣고
     "웹 앱"으로 배포하세요. (README.md 참고)
   - 시트 열 구성: A 작성시각 | B 이름 | C 메시지
   - 부적절한 글은 시트에서 해당 행을 직접 삭제하면 됩니다.
   ========================================================= */

var SHEET_NAME = "방명록";
var MAX_NAME = 12;
var MAX_MSG = 200;

/* 시트가 없으면 만들고 헤더를 넣는다 */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["작성시각", "이름", "메시지"]);
    sh.setFrozenRows(1);
    sh.getRange("B:C").setNumberFormat("@"); // 수식(=...)으로 해석되지 않도록 텍스트 고정
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/* 목록 조회 — 최신순 */
function doGet() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, items: [] });

  var rows = sh.getRange(2, 1, last - 1, 3).getValues();
  var items = rows
    .filter(function (r) {
      return r[1] && r[2];
    })
    .map(function (r) {
      return {
        ts: r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]) || 0,
        name: String(r[1]),
        msg: String(r[2]),
      };
    })
    .reverse();

  return json_({ ok: true, items: items });
}

/* 메시지 등록 */
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "bad_request" });
  }

  var name = String(data.name || "")
    .trim()
    .slice(0, MAX_NAME);
  var msg = String(data.msg || "")
    .trim()
    .slice(0, MAX_MSG);
  if (!name || !msg) return json_({ ok: false, error: "empty" });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // 동시에 여러 명이 써도 행이 겹치지 않게
  try {
    var sh = getSheet_();
    var now = new Date();
    var row = sh.getLastRow() + 1;
    sh.getRange(row, 2, 1, 2).setNumberFormat("@");
    sh.getRange(row, 1, 1, 3).setValues([[now, name, msg]]);
    return json_({
      ok: true,
      item: { ts: now.getTime(), name: name, msg: msg },
    });
  } finally {
    lock.releaseLock();
  }
}
