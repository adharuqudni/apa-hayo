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
let ignore = false;
let intervalTime;

const listBoxGenerator = (maxBox, maximumTrue) => {
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
        "bg-slate-500 cursor-pointer": isClicked,
        "bg-slate-50": !isClicked,
      })
    );
  }, [isClicked]);

  return <div {...other} className={className} ref={divRef}></div>;
}

const ProgressionBar = forwardRef(function ProgressionBar(props, ref) {
  const { isFinished, isTimeout, setIsTimeout } = props;
  const [sizePercent, setSizePercent] = useState(100);
  const insideRef = useRef();

  useImperativeHandle(
    ref,
    () => {
      return {
        refreshPercent() {
          setSizePercent(100);
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

    if (isFinished) clearInterval(intervalTime);
  }, [isFinished, isTimeout]);

  return (
    <div className="w-full h-[20px] border border-slate-300 rounded bg-slate-200">
      <div className={`w-full h-[16px] rounded bg-slate-400`} ref={insideRef} />
    </div>
  );
});

export default function Home() {
  const [isFinished, setIsFinished] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [listBox, setListBox] = useState([
    ...listBoxGenerator((parseInt(winCount / 5) + 3) * 3, (winCount % 5) + 3),
  ]);

  const progressionBarRef = useRef(null);

  const handleButtonModalClick = () => {
    if (isTimeout) {
      setWinCount(0);
    } else {
      setWinCount((prevValue) => prevValue + 1);
    }

    setListBox([...listBoxGenerator((parseInt(winCount / 5) + 3) * 3, (winCount % 5) + 3)]);
    progressionBarRef.current.refreshPercent();
    setIsFinished(false);
    setIsTimeout(false);
    ignore = false;
  };

  const handleBoxClick = (box) => {
    if (box.isClicked) {
      const tempList = listBox;
      tempList[box.index].isClicked = false;
      setListBox([...tempList]);
    }
  };

  useEffect(() => {
    const filtered = listBox.filter((val) => val.isClicked);
    if (filtered.length == 0) {
      setIsFinished(true);
    }
  }, [listBox]);

  return (
    <main className="h-full relative">
      <div className="absolute z-0 w-full">
        <div className="absolute z-0 w-full">
          <ProgressionBar
            isFinished={isFinished}
            isTimeout={isTimeout}
            setIsTimeout={setIsTimeout}
            ref={progressionBarRef}
          />
        </div>

        <div className="grid min-h-screen grid-cols-3 items-center gap-4 p-6">
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
      {(isFinished || isTimeout) && (
        <div className="absolute h-screen w-full bg-black bg-opacity-30 z-100 flex justify-center items-center ">
          <div
            className={
              "w-[52rem] h-[26rem] flex flex-col gap-3 justify-center items-center border border-slate-300 rounded " +
              (isFinished ? "bg-green-300" : "bg-red-300")
            }
          >
            <h1 className="text-white text-3xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center ">
              {" "}
              {isTimeout
                ? "Waduh waktu kamu habis ! "
                : "Selamat kamu berhasil menyelesaikan puzzle !"}
            </h1>
            <button
              onClick={handleButtonModalClick}
              className={
                "text-white font-bold py-2 px-4 border rounded " +
                (isFinished
                  ? " border-green-100 bg-green-500 hover:bg-green-700"
                  : "border-red-100 bg-red-500 hover:bg-red-700")
              }
            >
              Retry!
            </button>
            <h1 className="text-white text-xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] text-center ">
              {" "}
              Total Kemenangan Kamu : {winCount}
            </h1>
          </div>
        </div>
      )}
    </main>
  );
}
