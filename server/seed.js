// Run once with:  npm run seed
// Creates the creator account (password hashed) and sample Lesotho content.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Content = require('./models/Content');

const day = 24 * 60 * 60 * 1000;
const ago = n => new Date(Date.now() - n * day);

const samples = [
  {
    title: 'The Basotho Blanket: More Than Warmth',
    description: 'Why the Basotho blanket is a symbol of identity, status and ceremony across Lesotho.',
    category: 'Culture', contentType: 'article', isFeatured: true, status: 'Published', publishDate: ago(2),
    articleBody: 'The Basotho blanket is worn in the mountains, in town and at important ceremonies.\nEach pattern has its own meaning, and blankets are given at weddings, initiation and other big moments in life.\nIn this post I explain the history, the common patterns and how the blanket is used today.\n(Replace this sample text with your own research and photos.)'
  },
  {
    title: 'Maletsunyane Falls: Semonkong Travel Guide',
    description: 'How to get to Semonkong, what to see and where to stay when visiting one of the tallest single-drop waterfalls in Southern Africa.',
    category: 'Travel', contentType: 'article', isFeatured: true, status: 'Published', publishDate: ago(5),
    articleBody: 'Semonkong is known as the place of smoke because of the mist from the falls.\nYou can hike, ride a pony and enjoy the village atmosphere.\nTip: check road conditions before you travel, especially in the rainy season.\n(Add your own trip details, prices and photos.)'
  },
  {
    title: 'Morija Arts and Cultural Festival Highlights',
    description: 'Music, heritage and food: what makes the Morija festival a yearly highlight for Basotho and visitors.',
    category: 'Entertainment', contentType: 'article', isFeatured: true, status: 'Published', publishDate: ago(9),
    articleBody: 'Morija brings together traditional music, modern artists, storytelling and local food.\nIt is also a place to learn about Basotho history and museum collections.\n(Update with the latest festival dates and lineup.)'
  },
  {
    title: 'Youth, Jobs and Digital Skills in Lesotho',
    description: 'A student view on youth unemployment and how digital skills can open new opportunities.',
    category: 'Current Affairs', contentType: 'article', status: 'Published', publishDate: ago(1),
    articleBody: 'Many graduates in Lesotho struggle to find work, and more young people are looking at freelancing, online business and tech skills.\nIn this post I look at the challenges and some practical steps students can take.\n(Replace with current news, statistics and links to your sources before submission.)'
  },
  {
    title: 'Lesotho Highlands Water Project Explained',
    description: 'A simple explanation of how water from Lesotho supports both our economy and neighbouring South Africa.',
    category: 'Current Affairs', contentType: 'article', status: 'Published', publishDate: ago(12),
    articleBody: 'Lesotho is often called the water tower of Southern Africa.\nThe Lesotho Highlands Water Project moves water through dams and tunnels and also produces electricity.\n(Add current phase updates and trusted sources.)'
  },
  {
    title: 'Study Tips for Limkokwing Students',
    description: 'Simple habits for managing assignments, group work and exam stress.',
    category: 'Education', contentType: 'article', status: 'Published', publishDate: ago(15),
    articleBody: 'Plan your week, start assignments early and use a Git repository for every project.\nStudy in small sessions and ask lecturers questions early.'
  },
  {
    title: 'Mobile Money and Everyday Life in Lesotho',
    description: 'How mobile payments are changing the way Basotho send money, pay bills and run small businesses.',
    category: 'Technology', contentType: 'article', status: 'Published', publishDate: ago(20),
    articleBody: 'Mobile money lets people pay and send money without visiting a bank.\nIt helps small traders, but network access and fees are still concerns.'
  },
  {
    title: 'Winter in the Mountains: Skiing at Afriski',
    description: 'A lifestyle look at winter fun in the Maluti Mountains.',
    category: 'Lifestyle', contentType: 'article', status: 'Scheduled', publishDate: new Date(Date.now() + 7 * day),
    articleBody: 'Lesotho is one of the few places in Southern Africa with a ski resort.\n(This post is scheduled to show how the Scheduled status works.)'
  },
  {
    title: 'Draft: Street Food in Maseru',
    description: 'Notes for a future post about popular street food.',
    category: 'Lifestyle', contentType: 'article', status: 'Draft',
    articleBody: 'Still writing this one.'
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = (process.env.CREATOR_EMAIL || 'creator@example.com').toLowerCase();
    const password = await bcrypt.hash(process.env.CREATOR_PASSWORD || 'ChangeMe123', 10);

    await User.findOneAndUpdate(
      { email },
      {
        name: process.env.CREATOR_NAME || 'Lesotho Voices',
        email, password,
        bio: 'Hi, I am a Limkokwing student blogger sharing stories about Basotho culture, travel and what is happening in Lesotho today.',
        avatarUrl: ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if ((await Content.countDocuments()) === 0) {
      await Content.create(samples);
      console.log('Sample content added');
    } else {
      console.log('Content already exists, skipping samples');
    }
    console.log('Seed finished. Creator login email:', email);
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
