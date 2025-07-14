# 粵拼練習應用程序 / Jyutping Practice App

一個互動式粵拼練習應用程序，幫助用戶學習和練習粵語發音。

## 🌐 線上演示

**查看線上應用程序：** https://kiukiu328.github.io/jyutping_practice/

## 📖 概述

這是一個粵拼練習應用程序，旨在幫助用戶學習和練習粵語發音。應用程序會顯示中文字符，要求用戶輸入正確的粵拼羅馬化。透過互動式測驗和即時反饋，用戶可以逐步提升粵語拼讀能力。

## ✨ 功能特色

### 🎯 測驗系統
- **練習會話**：每個會話包含可自訂的題目數量（5、10、20、30或50題）
- **即時反饋**：輸入框會變色提示您的輸入是否正確
- **分數追蹤**：在會話過程中查看您的當前分數和百分比
- **進度條**：會話進度的視覺指示器

### 🎚️ 字符範圍選擇
- **默認範圍**：練習最常見的100個中文字符
- **自訂範圍**：使用滑塊選擇特定字符範圍進行重點練習
- **範圍預覽**：精確查看您將要練習的字符

### 🔄 錯誤答案管理
- **自動追蹤**：所有錯誤答案都會自動保存
- **重試功能**：只練習您答錯的字符
- **持久存儲**：錯誤答案在會話間保存
- **清除選項**：需要時重置您的錯誤答案歷史

### 🎵 附加功能
- **音效**：答對時播放成功音效
- **鍵盤快捷鍵**：使用 Enter 或空格鍵提交答案並繼續
- **外部詞典**：點擊詞典按鈕在 CUHK Lexis 中查找字符
- **會話總結**：每次完成會話後的詳細結果報告

## 🚀 使用方法

### 1. 開始會話
- 點擊「開始新測驗」按鈕開始練習
- 在設定中配置您偏好的題目數量

### 2. 練習字符
- 系統會顯示一個中文字符
- 在輸入框中輸入相應的粵拼羅馬化
- 如果您輸入正確，輸入框會變綠色；如果錯誤，會變紅色
- 按 Enter 或空格鍵提交您的答案

### 3. 查看結果
- 提交後，您會看到答案是否正確
- 查看該字符的所有可能正確粵拼發音
- 按 Enter 或空格鍵繼續下一題

### 4. 完成會話
- 完成所有題目後，查看您的會話總結
- 檢視您的分數、百分比和任何錯誤答案
- 選擇開始新會話或重試錯誤答案

### 5. 自訂練習
- 在設定中調整字符範圍
- 更改每次會話的題目數量
- 練習您之前答錯的特定字符

## 💡 有效練習的技巧

- **注重準確性**：應用程序會即時追蹤您的輸入，所以要力求正確輸入
- **使用錯誤答案複習**：定期練習您答錯的字符，加強記憶
- **調整範圍**：從常見字符開始，逐漸擴大您的練習範圍
- **外部資源**：使用詞典查找功能了解更多字符信息和用法
- **持續練習**：定期短時間練習比長時間集中練習更有效

## ⌨️ 鍵盤快捷鍵

- **Enter 或空格鍵**：提交答案 / 繼續下一題
- **自動聚焦**：輸入框自動聚焦以便無縫輸入

---

## 🛠️ Development Guide

### 🔧 Installation

Install the required dependencies:

```bash
npm install
```

### 💻 Development

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 🏗️ Production Build

Create a production build:

```bash
npm run build
```



## 🤝 Contributing

Issues and pull requests are welcome! 

## 🙏 Acknowledgments & Data Sources

This project uses the following data sources:

- **Common word list**: From [CUHK Institute of Chinese Studies - Cantonese Pronunciation Dictionary](https://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/faq.php)
- **Jyutping data**: From [jyutnet/cantonese-books-data](https://github.com/jyutnet/cantonese-books-data)

Thanks to these resource providers for their contributions to the Cantonese learning community.
