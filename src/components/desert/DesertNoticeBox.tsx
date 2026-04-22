import '../../styles/Desert.css';

const NOTICES = [
  'ここは、人のために物語を綴る場所です',
  '読んだ人を傷つける言葉は書かないでください',
  '個人が特定される情報は書かないでください',
  '振り返ることがつらい場合は、無理に書かなくて大丈夫です',
  '安心できる場を守るため、内容によっては非表示対応を行います',
];

const DesertNoticeBox = () => (
  <div className="desert-notice-box">
    <p className="desert-notice-box__title">はじめに</p>
    <ul className="desert-notice-box__list">
      {NOTICES.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  </div>
);

export default DesertNoticeBox;
