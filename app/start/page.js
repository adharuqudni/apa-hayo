"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import _, { size } from "lodash";
import classNames from "classnames";


const listBoxGenerator = () => {

    const list = _.range(0,9).map((index)=>{
        const randomNumber = Math.floor(Math.random() * 100) + 1;

        return {
            index,
            isClicked: randomNumber > 20 && randomNumber <= 40
        }
    })

    return list
}



function Box(props) {
  const { index, isClicked, ...other } = props;
  const divRef = useRef()
  const [isClick, setIsClick] = useState(isClicked)
  const handleBoxClick = useCallback((e) => {
    if(isClicked) {
        setIsClick(false)
    }
  }, [isClicked]);
  const [className, setClassName] = useState('')
  
  useEffect(() => {
    setClassName(classNames(`w-full h-full border border-slate-300 rounded bg-slate-50 `,{ 'bg-slate-500 cursor-pointer': isClick, 'bg-slate-50': !isClick }))
  }, [isClick])
  
  return (
    <div {...other} className={className} ref={divRef} onClick={handleBoxClick}>
    </div>
  );
}

function ProgressionBar() {
  const [sizePercent, setSizePercent] = useState(100);
  const insideRef = useRef();
  useEffect(() => {
    let interval;
    const sizeInterval = async function () {
        setSizePercent((prevTime) => {
            if(prevTime <= 0){
                clearInterval(interval);
            }
            insideRef.current.style.width = `${prevTime}%`;
            return prevTime - 1;
          });
    };
    if (!interval) interval = setInterval(sizeInterval, 500);
  }, []);

  return (
    <div className="w-full h-[20px] border border-slate-300 rounded bg-slate-200">
      <div className={`w-full h-[16px] rounded bg-slate-400`} ref={insideRef} />
    </div>
  );
}

export default function Home() {
  const [listBox, setListBox] = useState([...listBoxGenerator()])

  return (
    <main className="min-h-screen">
      <ProgressionBar />
      <div className="grid min-h-screen grid-cols-3 items-center gap-4 p-6">
        {listBox.map((val) => {
          return <Box key={val.index} index={val.index} isClicked={val.isClicked}/>;
        })}
      </div>
    </main>
  );
}
