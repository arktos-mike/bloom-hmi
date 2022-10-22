import { Pie } from '@ant-design/plots';

const stopObj = (reason: string) => {
  let color = '00000000';
  if (reason == 'other') { color = '#000000FF' }
  else if (reason == 'button') { color = '#7339ABFF' }
  else if (reason == 'warp') { color = '#FF7F27FF' }
  else if (reason == 'weft') { color = '#FFB300FF' }
  else if (reason == 'tool') { color = '#E53935FF' }
  else if (reason == 'fabric') { color = '#005498FF' }
  else if (reason == 'run') { color = '#52c41aFF' }
  return color;
}
const Component = (props: any) => {
  return <Pie
    renderer='svg'
    appendPadding={10}
    angleField={'value'}
    radius={1} innerRadius={0.3}
    colorField={'reason'}
    label={{
      type: '',
      offset: '-50%',
      style: {
        textAlign: 'center',
        fontSize: 12,
        content: "{value}"
      }
    }}
    color={(data) => { return stopObj(data.reason) }}
    statistic={{ title: false, content: false }}
    tooltip={false}
    legend={false}
    data={props.data} />;
};

export default Component;




