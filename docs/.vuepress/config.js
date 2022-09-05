module.exports = {
    base: '/blog',
    title: '嘉宇的博客',
    description: 'Just playing around!',
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        sidebarDepth: 2,
        lastUpdated: '上一次更新: ',
        nav: [
            { text: '导引', link: '/guide/' },
            {
                text: 'GitHub',
                items: [
                    { text: 'GitHub地址', link: 'https://github.com/jiayu1011' },
                ]
            }
        ],
        // sidebar: {
        //     '/vue/': [
        //         '/vue/',
        //         {
        //             title: 'Vue知识',
        //             children: []
        //         }
        //     ],
        //     '/js/': [
        //         '/js/',
        //         {
        //             title: 'JS知识',
        //             children: []
        //         }
        //     ]
        // },

        sidebar: [
            '/vue/',
            '/js/'
        ]
    }
}