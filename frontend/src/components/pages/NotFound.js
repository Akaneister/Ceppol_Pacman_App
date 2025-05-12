import React from 'react';

const NotFound = () => {
  return (
    <div>
      <div className="header">
        <style>{`
          @import url('https://fonts.googleapis.com/css?family=Lato:300,400');

          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
          }

          .header {
            min-height: 100vh;
            height: 100vh;
            width: 100vw;
            position: relative;
            text-align: center;
            background: linear-gradient(60deg, rgba(84, 58, 183, 1) 0%, rgba(0, 172, 193, 1) 100%);
            color: white;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .content {
            z-index: 2;
            position: relative;
            padding-top: 10vh;
            padding-bottom: 2vh;
            text-align: center;
          }

          h1 {
            font-family: 'Lato', sans-serif;
            font-weight: 300;
            letter-spacing: 2px;
            font-size: 4vw;
            color: #FFC800;
            margin: 0 0 1rem 0;
            word-break: break-word;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }

          .subtitle {
            font-family: 'Lato', sans-serif;
            font-size: 1.5vw;
            color: #ffffff;
            margin-bottom: 2rem;
            opacity: 0.8;
          }

          .action-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }


          a:hover {
            background-color: #27adbc;
            color: white;
          }

          .waves {
            position: absolute;
            left: 0;
            width: 100vw;
            height: 80vh;
            min-height: 100px;
            max-height: 300px;
            bottom: 0;
            z-index: 1;
          }

          .parallax > use {
            animation: move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
          }

          .parallax > use:nth-child(1) {
            animation-delay: -2s;
            animation-duration: 7s;
            fill: rgba(255,255,255,0.7);
          }

          .parallax > use:nth-child(2) {
            animation-delay: -3s;
            animation-duration: 10s;
            fill: rgba(255,255,255,0.5);
          }

          .parallax > use:nth-child(3) {
            animation-delay: -4s;
            animation-duration: 13s;
            fill: rgba(255,255,255,0.3);
          }

          @keyframes move-forever {
            0% { transform: translate3d(-90px, 0, 0);}
            100% { transform: translate3d(85px, 0, 0);}
          }

          @media (max-width: 768px) {
            h1 {
              font-size: 8vw;
            }
            .subtitle {
              font-size: 3vw;
            }
            .waves {
              height: 42vh;
              min-height: 40px;
            }
          }

          @media (max-width: 480px) {
            h1 {
              font-size: 10vw;
            }
            .subtitle {
              font-size: 4vw;
            }
            .waves {
              height: 40vh;
              min-height: 60px;
            }
          }
        `}</style>
        <div className="content">
          <h1>Error 404: Page Not Found</h1><br />
          <p className="subtitle">Ooops , mauvais chemin ou page</p>
          <div className="action-links">

          </div>
        </div>
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default NotFound;
