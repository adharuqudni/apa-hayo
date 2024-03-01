"use client";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import _, { size } from "lodash";
import classNames from "classnames";
import Axios from "axios";

let ignore = false;
let intervalTime;

const getHighScore = async () => {
  try {
    const highscore = await Axios.get("/api/highscore");
    return highscore.data;
  } catch (e) {
    console.log(e.message);
  }
};

const updateHighScore = async (score) => {
  try {
    const highscore = await Axios.post("/api/highscore", {
      high_score: score,
    });
    return highscore.data;
  } catch (e) {
    console.log(e.message);
  }
};



const listBoxGenerator = (winCount) => {
  const level = parseInt(winCount / 5);
  const stack = level + 2;
  const maxBox = Math.pow(stack, 2);
  const minimumTrue = stack;
  const maxTrue = stack + level;
  const maximumTrue = (winCount % maxTrue) + minimumTrue;

  let isClickedArr = Array(maximumTrue).fill(true);

  for (let i = maximumTrue; i < maxBox; i++) {
    isClickedArr.push(false);
  }

  for (let i = isClickedArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [isClickedArr[i], isClickedArr[j]] = [isClickedArr[j], isClickedArr[i]];
  }

  let indexArr = Array.from({ length: maxBox }, (_, i) => i);

  let arr = indexArr.map((index, i) => ({ index, isClicked: isClickedArr[i] }));

  return arr;
};

function Box(props) {
  const { index, isClicked, ...other } = props;
  const divRef = useRef();
  const [className, setClassName] = useState("");

  useEffect(() => {
    setClassName(
      classNames(`w-full h-full border border-slate-300 rounded bg-slate-50 `, {
        "bg-yellow-500 cursor-pointer": isClicked,
        "bg-slate-50": !isClicked,
      })
    );
  }, [isClicked]);

  return <div {...other} className={className} ref={divRef}></div>;
}

const ProgressionBar = forwardRef(function ProgressionBar(props, ref) {
  const { isFinished, isStart, isTimeout, setIsTimeout } = props;
  const [sizePercent, setSizePercent] = useState(100);
  const insideRef = useRef();

  useImperativeHandle(
    ref,
    () => {
      return {
        refreshPercent() {
          setSizePercent(100);
        },
        addPercent() {
          setSizePercent((prevTime) => {
            insideRef.current.style.width = `${prevTime}%`;
            return prevTime + 3;
          });
        },
        getSizePercent() {
          return insideRef.current.style.width;
        },
      };
    },
    []
  );

  useEffect(() => {
    const sizeInterval = async function () {
      setSizePercent((prevTime) => {
        if (prevTime <= 0) {
          setIsTimeout(true);
          clearInterval(intervalTime);
        }
        insideRef.current.style.width = `${prevTime}%`;
        return prevTime - 5;
      });
    };
    if (!ignore) {
      intervalTime = setInterval(sizeInterval, 250);
      ignore = true;
    }

    if (isFinished || isStart) clearInterval(intervalTime);
  }, [isFinished, isStart, isTimeout]);

  return (
    <div className="w-full h-[20px] border border-slate-300 rounded bg-slate-200">
      <div className={`w-full h-[16px] rounded bg-slate-400`} ref={insideRef} />
    </div>
  );
});

export default function Home() {
  const [isFinished, setIsFinished] = useState(false);
  const [isStart, setIsStart] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gridClass, setGridClass] = useState(
    "grid min-h-screen grid-cols-2 items-center gap-4 p-6"
  );
  const [listBox, setListBox] = useState([...listBoxGenerator(winCount)]);
  const progressionBarRef = useRef(null);
  const audioClickRef = useRef(null);
  const backgroudaAudioRef = useRef(null);
  const gridRef = useRef(null);
  const handleButtonModalClick = async () => {
    if (isStart) {
      backgroudaAudioRef.current.play();
      setIsStart(false);
    }
    progressionBarRef.current.refreshPercent();
    setIsFinished(false);
    setIsTimeout(false);
    ignore = false;
  };

  useEffect(() => {
    async function fetchData() {
      const prev_high_score = await getHighScore();
      if (prev_high_score.score < score) {
        const high_score = await updateHighScore(score);
        setHighScore(high_score.score);
      }
      setWinCount(0);
      setScore(0);
    }
    if (isTimeout) {
      fetchData();
    }
  }, [isTimeout]);

  const handleBoxClick = (box) => {
    if (box.isClicked) {
      audioClickRef.current.play();
      const tempList = listBox;
      tempList[box.index].isClicked = false;
      const percentTime = progressionBarRef.current.getSizePercent();
      setScore(
        (prevScore) =>
          (prevScore += parseInt(
            100 * (parseInt(percentTime.slice(0, -1)) / 100)
          ))
      );
      progressionBarRef.current.addPercent();
      setListBox([...tempList]);
    }
  };

  useEffect(() => {
    if (isTimeout) {
      gridRef.current.style["grid-template-columns"] =
        "repeat(2, minmax(0, 1fr))";
    } else {
      gridRef.current.style["grid-template-columns"] = `repeat(${
        parseInt(winCount / 5) + 2
      }, minmax(0, 1fr))`;
    }
    setListBox([...listBoxGenerator(winCount)]);
  }, [winCount]);

  useEffect(() => {
    console.log(!isTimeout && isFinished);
    if (!isTimeout && isFinished) {
      setWinCount((prevValue) => prevValue + 1);
    }
  }, [isFinished]);

  useEffect(() => {
    async function fetchData() {
      const high_score = await getHighScore();
      setHighScore(high_score.score);
      const filtered = listBox.filter((val) => val.isClicked);
      if (filtered.length == 0) {
        setIsFinished(true);
      }
    }
    fetchData();
  }, [listBox]);

  return (
    <main className="h-full relative">
      <audio loop ref={backgroudaAudioRef} src="./bg.mp3" type="audio/mpeg">
        <source />
      </audio>
      <audio ref={audioClickRef} src="./click.mp3" type="audio/mpeg">
        <source />
      </audio>
      <div className="absolute z-0 w-full">
        <div className="absolute z-0 w-full">
          <ProgressionBar
            isStart={isStart}
            isFinished={isFinished}
            isTimeout={isTimeout}
            setIsTimeout={setIsTimeout}
            ref={progressionBarRef}
          />
        </div>

        <div ref={gridRef} className={gridClass}>
          {listBox.map((val) => {
            return (
              <Box
                key={val.index}
                index={val.index}
                isClicked={val.isClicked}
                onClick={(e) => handleBoxClick(val)}
              />
            );
          })}
        </div>
      </div>
      {(isFinished || isTimeout || isStart) && (
        <div className="absolute h-screen w-full bg-black bg-opacity-30 z-100 flex justify-center items-center ">
          <div
            className={
              "w-[52rem] h-[26rem] flex flex-col gap-3 justify-center items-center border border-slate-300 rounded " +
              ((isFinished && !isTimeout) || isStart
                ? "bg-green-300"
                : "bg-red-300")
            }
          >
            <h1 className="text-white text-3xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center ">
              {" "}
              {winCount == 0
                ? isTimeout
                  ? "Waduh waktu kamu habis ! "
                  : "Selamat Datang di Permainan Sepele"
                : "Selamat kamu berhasil menyelesaikan puzzle !"}
            </h1>
            <h1 className="text-white text-l drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center ">
              Cara Bermain: Tekan warna kuning secepat mungkin
            </h1>
            <button
              onClick={handleButtonModalClick}
              className={
                "text-white font-bold py-2 px-4 border rounded " +
                ((isFinished && !isTimeout) || isStart
                  ? " border-green-100 bg-green-500 hover:bg-green-700"
                  : "border-red-100 bg-red-500 hover:bg-red-700")
              }
            >
              {winCount == 0 ? "Mulai!" : "Next Level"}
            </button>
            <h1 className="text-white text-xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center ">
              {" "}
              Total Score Kamu : {score}
            </h1>
            <h1 className="text-white text-3xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center ">
              {" "}
              <b>High Score Semua Orang: {highScore}</b>
            </h1>
          </div>
        </div>
      )}
    </main>
  );
}
