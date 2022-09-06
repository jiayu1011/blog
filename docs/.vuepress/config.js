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
            {
                text: '导引',
                link: '/guide/'
            },
            {
                text: 'Vue',
                link: '/vue/'
            },
            {
                text: 'GitHub',
                items: [
                    { text: 'GitHub地址', link: 'https://github.com/jiayu1011' },
                ]
            }
        ],
        // sidebar: {
        //     '/vue/': [
        //         {
        //             title: 'Vue',
        //             collapsable: false,
        //             children: [
        //                 { title: 'Vue基础', path: '/vue/' },
        //                 { title: 'Vue基础', path: '/vue/Vue基础/' },
        //             ]
        //         }
        //     ],
        // }
        sidebar: 'auto'
    }
}