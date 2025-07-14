import requests
from bs4 import BeautifulSoup
pages = [1,501,1001,1501,2001,2501,3001,3501,4001,4501,5001,5501,6001,6501,7001]
words = ""
big5s = ""
for page in pages:
    url = f'https://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/faq.php?s={page}'
    response = requests.get(url)
    response.encoding = 'big5hkscs'

    soup = BeautifulSoup(response.text, 'html.parser')
    tr_tags = soup.find_all('tr')

    for tr in tr_tags:
        td_tags = tr.find_all('td')
        if len(td_tags) >= 6:
            words += td_tags[2].find('a').text.strip() 
            big5s += td_tags[2].find('a').get('href').split('=')[-1].strip() + '\n'
            words += td_tags[5].find('a').text.strip()
            big5s += td_tags[5].find('a').get('href').split('=')[-1].strip() + '\n'

with open('common_words.txt', 'w', encoding='utf-8') as f:
    f.write(words)

with open('big5_map.txt', 'w', encoding='utf-8') as f:
    f.write(big5s)