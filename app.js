const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8000;

const newspapers = [
    {
        name: 'MoneyLion',
        address: 'https://www.moneylion.com/learn/average-cell-phone-bill-per-month/',
        base: 'https://www.moneylion.com/'
    },
    {
        name: 'Self',
        address: 'https://www.self.inc/blog/how-much-is-phone-bill-for-one-person',
        base: 'https://www.self.inc/'
    },
    {
        name: 'Astound',
        address: 'https://www.astound.com/learn/mobile/average-cell-phone-bill/',
        base: 'https://www.astound.com/'
    },
    {
        name: 'WhistleOut',
        address: 'https://www.whistleout.com/CellPhones/Guides/average-phone-plan-price',
        base: 'https://www.whistleout.com/'
    },
    {
        name: 'AllConnect',
        address: 'https://www.allconnect.com/blog/average-cost-of-cellphone-plan',
        base: 'https://www.allconnect.com/'
    },
    {
        name: 'MintMobile',
        address: 'https://www.mintmobile.com/blog/average-phone-bill-per-month/',
        base: 'https://www.mintmobile.com/'
    }
];

const articles = [{
    name: 'MoneyLion',
    address: 'https://www.moneylion.com/learn/average-cell-phone-bill-per-month/',
    base: 'https://www.moneylion.com/'
},
{
    name: 'Self',
    address: 'https://www.self.inc/blog/how-much-is-phone-bill-for-one-person',
    base: 'https://www.self.inc/'
},
{
    name: 'Astound',
    address: 'https://www.astound.com/learn/mobile/average-cell-phone-bill/',
    base: 'https://www.astound.com/'
},
{
    name: 'WhistleOut',
    address: 'https://www.whistleout.com/CellPhones/Guides/average-phone-plan-price',
    base: 'https://www.whistleout.com/'
},
{
    name: 'AllConnect',
    address: 'https://www.allconnect.com/blog/average-cost-of-cellphone-plan',
    base: 'https://www.allconnect.com/'
},
{
    name: 'MintMobile',
    address: 'https://www.mintmobile.com/blog/average-phone-bill-per-month/',
    base: 'https://www.mintmobile.com/'
}];

const scrapeArticles = async (newspaper) => {
    try {
        const response = await axios.get(newspaper.address);
        const $ = cheerio.load(response.data);

        console.log($('body').html()); // Log the HTML body to check its structure

        $('p:contains("average cell phone bill")').each(function () {
            const title = $(this).text();
            const url = $(this).find('a').attr('href');
            const price = $(this).find('.price').text().trim();

            if (title && url && price) {
                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name,
                    price,
                });
            }
        });
    } catch (error) {
        console.error(`Error fetching data from ${newspaper.name}: ${error.message}`);
    }
};

const fetchArticles = async () => {
    await Promise.all(newspapers.map(scrapeArticles));
};

app.get('/data', (req, res) => {
    res.json({ message: 'Welcome to The Data Bank API' });
});

app.get('/news', async (req, res) => {
    articles.length = 0; // Clear existing articles
    try {
        await fetchArticles();
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.find((np) => np.name === newspaperId);

    if (!newspaper) {
        return res.status(404).json({ error: 'Newspaper not found' });
    }

    articles.length = 0; // Clear existing articles
    try {
        await fetchArticles(newspaper);
        const specificArticles = articles.filter((article) => article.source === newspaperId);
        res.json(specificArticles);
    } catch (error) {
        console.error(`Error fetching articles for ${newspaper.name}:`, error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));