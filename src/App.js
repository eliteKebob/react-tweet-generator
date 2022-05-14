import React, { useState, createRef, useEffect } from "react"
import "./styles.scss"
import {
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ShareIcon,
  VerifiedIcon,
} from "./icons.js"
import { AvatarLoader } from "./loaders"
import { useScreenshot } from "use-react-screenshot"
import { language } from "./language"
import { useInput } from "./hooks/useInput.js"

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement("CANVAS")
  var ctx = canvas.getContext("2d")
  var img = new Image()
  img.crossOrigin = "Anonymous"
  img.onload = function () {
    canvas.height = img.height
    canvas.width = img.width
    ctx.drawImage(img, 0, 0)
    var dataURL = canvas.toDataURL(outputFormat || "image/png")
    callback.call(this, dataURL)
    // Clean up
    canvas = null
  }
  img.src = url
}

const tweetFormat = (tweet) => {
  tweet = tweet
    .replace(/@([\w]+)/g, "<span>@$1</span>")
    .replace(/#([\wşçöğüıİ]+)/gi, "<span>#$1</span>")
    .replace(/(https?:\/\/[\w\.\/]+)/, "<span>$1</span>")
    .replace(/\n/g, "<br />")
  return tweet
}

const formatNumber = (number) => {
  if (!number) {
    number = 0
  }
  if (number < 1000) {
    return number
  }
  number /= 1000
  number = String(number).split(".")

  return (
    number[0] + (number[1] > 100 ? "," + number[1].slice(0, 1) + " B" : " B")
  )
}

function App() {
  const tweetRef = createRef(null)
  const downloadRef = createRef()
  const [inputs, setInputs] = useInput({ name: "", username: "", tweet: "" })
  const [isVerified, setIsVerified] = useState(0)
  const [avatar, setAvatar] = useState()
  const [retweets, setRetweets] = useState(0)
  const [quoteTweets, setQuoteTweets] = useState(0)
  const [likes, setLikes] = useState(0)
  const [lang, setLang] = useState("tr")
  const [image, takeScreenshot] = useScreenshot()
  const [langText, setLangText] = useState()
  const getImage = () => takeScreenshot(tweetRef.current)

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    setLangText(language[lang])
  }, [lang])

  useEffect(() => {
    if (image) {
      downloadRef.current.click()
    }
  }, [image, downloadRef])

  useEffect(() => {
    console.log(image)
  }, [image])

  const avatarHandle = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.addEventListener("load", function () {
      setAvatar(this.result)
    })
    reader.readAsDataURL(file)
  }

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${inputs.username}`
    )
      .then((res) => res.json())
      .then((data) => {
        const twitter = data[0]
        convertImgToBase64(
          twitter.profile_image_url_https,
          function (base64Image) {
            setAvatar(base64Image)
          }
        )
        setInputs({
          ...inputs,
          name: twitter.name,
          username: twitter.screen_name,
          tweet: twitter.status.text,
        })
        setRetweets(twitter.status.retweet_count)
        setLikes(twitter.status.favorite_count)
      })
  }

  return (
    <>
      <div className="tweet-settings">
        <h3>{langText?.settings}</h3>
        <ul>
          <li>
            <label>{langText?.name}</label>
            <input
              type="text"
              className="input"
              name="name"
              value={inputs.name}
              onChange={setInputs}
            />
          </li>
          <li>
            <label htmlFor="">{langText?.username}</label>
            <input
              type="text"
              className="input"
              name="username"
              value={inputs.username}
              onChange={setInputs}
            />
          </li>
          <li>
            <label htmlFor="">Tweet</label>
            <textarea
              name="tweet"
              value={inputs.tweet}
              onChange={setInputs}
              className="textarea"
              maxLength="290"
            />
          </li>
          <li>
            <label htmlFor="">Avatar</label>
            <input type="file" className="input" onChange={avatarHandle} />
          </li>
          <li>
            <label htmlFor="">Retweet</label>
            <input
              type="number"
              className="input"
              value={retweets}
              onChange={(e) => setRetweets(e.target.value)}
            />
          </li>
          <li>
            <label htmlFor="">{langText?.quote}</label>
            <input
              type="number"
              className="input"
              value={quoteTweets}
              onChange={(e) => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label htmlFor="">{langText?.like}</label>
            <input
              type="number"
              className="input"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label htmlFor="">{langText?.verified}</label>
            <select
              onChange={(e) => setIsVerified(e.target.value)}
              value={isVerified}
            >
              <option value="1">{langText?.yes}</option>
              <option value="0">{langText?.no}</option>
            </select>
          </li>
          <button onClick={getImage}>{langText?.create}</button>
          <div className="download-url">
            {image && (
              <a ref={downloadRef} href={image} download="tweet.png">
                Tweeti İndir
              </a>
            )}
          </div>
        </ul>
      </div>
      <div className="tweet-container">
        <div className="app-language">
          <span
            onClick={() => setLang("tr")}
            className={lang === "tr" && "active"}
          >
            Türkçe
          </span>
          <span
            onClick={() => setLang("en")}
            className={lang === "en" && "active"}
          >
            English
          </span>
        </div>
        <div className="fetch-info">
          <input
            type="text"
            name="username"
            value={inputs.username}
            onChange={handleChange}
            placeholder="Twitter Kullanıcı Adı"
          />
          <button onClick={fetchTwitterInfo}>{langText?.fetch}</button>
        </div>
        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} alt="avatar" />) || <AvatarLoader />}
            <div className="tweet-author-text">
              <div className="name">
                {inputs.name || "Adın"}{" "}
                {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
              </div>
              <div className="username">
                @{inputs.username || "Kullanıcı adı"}
              </div>
            </div>
          </div>
          <div className="tweet-content">
            <p
              dangerouslySetInnerHTML={{
                __html:
                  (inputs.tweet && tweetFormat(inputs.tweet)) ||
                  "Bu alana örnek tweet gelecek",
              }}
            />
          </div>
          <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweets) || 0}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets) || 0}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes) || 0}</b> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
            <span>
              <RetweetIcon />
            </span>
            <span>
              <LikeIcon />
            </span>
            <span>
              <ShareIcon />
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
