import playStore from "../../../images/playstore.png";
import appStore from "../../../images/Appstore.png";
import "./footer.css";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="leftFooter">
        <h4>DOWNLOAD OUR APP</h4>
        <p>Download App for Android and iOS mobile phone</p>
        <img src={playStore} alt="playStore" />
        <img src={appStore} alt="appStore" />
      </div>

      <div className="midFooter">
        <h1>AKJAY.</h1>
        <p>High Quality is our first priority</p>
        <p>Copyrights 2022 &copy; Abhinav</p>
      </div>

      <div className="rightFooter">
        <h4>Follow Us</h4>
        <a href="">Twitter</a>
        <a href="">LinkedIn</a>
        <a href="">GitHub</a>
      </div>
    </footer>
  );
};

export default Footer;
