// 改文字、封面图和项目地址。image 可填写 assets/ 下的文件路径。
const works = [
  {
    id: 'memory', type: 'project', title: 'ROAD DNA / 声音记忆',
    summary: '沿路线、地点与声音，探索一座可以反复回访的记忆宇宙。',
    theme: '声音交互 · 乘员体验', image: '',
    description: 'ROAD DNA 的声音记忆原型。可以从全景进入地点，聆听与场景相关的声音，切换初访、最近一次到访和累积记忆。',
    steps: ['从全景点选「家」「小公园」等地点，或拖动环顾。', '点击播放，听取该场景的声音。', '切换访问版本，比较同一地点的记忆如何呈现。'],
    url: './road-dna/index.html'
  },
  {
    id: 'handover', type: 'study', title: '接管提示',
    summary: '试两种提示方式，观察你何时理解并确认接管。',
    theme: '驾驶辅助 · 提示层级', image: '',
    description: '选择视觉提示或分层提示，在同一模拟场景中体验两种界面的反馈方式。原型记录本次对确认按钮的响应时间。'
  },
  {
    id: 'climate', type: 'study', title: '座舱风向',
    summary: '拖动气流落点，直接控制风的方向与力度。',
    theme: '座舱控制 · 空间映射', image: '',
    description: '在空间图中拖动气流落点，或使用滑块调整方向。用可视化反馈把界面上做的调整和预期出风方向关联起来。'
  },
  {
    id: 'gesture', type: 'study', title: '一次挥手之后',
    summary: '对比高置信度、低置信度、未识别时的反馈与撤销。',
    theme: '车载手势 · 容错', image: '',
    description: '用一个换歌曲的场景体验识别后的三条反馈路径。交互效果由手动选择的识别状态触发。'
  },
  {
    id: 'sound-lab', type: 'result', title: '旋律辨识实验',
    summary: '打开声音记忆原型中的独立旋律辨识实验页面。',
    theme: 'ROAD DNA · 声音实验', image: '',
    description: '声音记忆原型页面给出的旋律辨识实验入口。', url: './road-dna/sound-lab.html'
  }
];
const featured = ['memory', 'handover', 'climate', 'gesture'];
