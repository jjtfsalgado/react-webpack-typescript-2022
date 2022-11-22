import type {SelectProps} from 'antd';
import {Button, DatePicker, Form, Input, Table as TableAntd, Select} from "antd";
import React, {useEffect, useState} from "react";
import css from "./table.scss";
import { FilterOutlined, PushpinOutlined, LineChartOutlined} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import dataJSON from "../data.json";
import moment from 'moment';
import * as http from 'http';
import axios from 'axios';
const { RangePicker } = DatePicker;
const { Search } = Input;

const onSearch = (value: string) => console.log(value);

console.log(dataJSON);

const columns = [
    {
        title: 'Date',
        dataIndex: 'Test Date/Time',
        key: 'Test Date/Time',
        width: 120,
        sorter: {
            compare: (a: any, b: any) => a.timestamp - b.timestamp,
            multiple: 1
        },
    },
    {
        title: 'Official',
        dataIndex: 'official',
        key: 'official',
        width: 200,
        sorter: {compare: (a: any, b: any) => a.official.localeCompare(b.official), multiple: 2}
    },
    {
        title: 'Category',
        dataIndex: 'Category',
        key: 'Category',
        width: 200,
        sorter: {compare: (a: any, b: any) => a.Category.localeCompare(b.Category), multiple: 3}
    },
    {
        title: 'Assessment',
        dataIndex: 'Score',
        key: 'Score',
        sorter: {compare: (a: any, b: any) => a.Score - b.Score, multiple: 4}
    },
    {
        title: 'Comment',
        dataIndex: 'comment',
        key: 'comment'
    }
];


export const Table = () => {
    const [filterState, setFilterState] = useState<boolean>();
    const [view, setView] = useState<boolean>();
    const [data, setData] = useState<any>();

    useEffect(() => {
        (async () => {
            const response = await axios.get(dataJSON as any);
            const d = response.data.map((i: any, ix: number) => ({...i, key: "" + ix, official: `${i["First Name"]} ${i["Last Name"]}`, timestamp: moment(i["Test Date/Time"].slice(0, 10), "DD/MM/YYYY").unix()}));
            setData(d);    
        })()
    }, []);
    
    return (
        <div>
            <div className={css.header}>
                <div className={css.left}>
                    <Search placeholder="Input search text" onSearch={onSearch} style={{maxWidth: "200px"}} />
                    <Button icon={<FilterOutlined />} onClick={() => setFilterState(!filterState)}/>
                </div>
                <div className={css.spacer}/>
                <div className={css.right}>
                    <Button icon={<LineChartOutlined />} onClick={() => setView(!view)}/>
                </div>
            </div>
            <div className={css.body}>
                {filterState && <Filter/>}
                {!view && <TableAntd columns={columns} dataSource={data} className={css.table} scroll={{y: 500}} onRow={(record, rowIndex) => ({onClick: event => alert(record.key)})}/>}
                {view && <DemoLine data={data} />}
            </div>
        </div>
    );
}

type RequiredMark = boolean | 'optional';

const handleChange = (value: string[]) => {
    console.log(`selected ${value}`);
};

const options: SelectProps['options'] = [];
for (let i = 10; i < 36; i++) {
    options.push({
        label: i.toString(36) + i,
        value: i.toString(36) + i,
    });
}
const Filter = () => {
    const [form] = Form.useForm();
    const [requiredMark, setRequiredMarkType] = useState<RequiredMark>('optional');
    const [pin, setPin] = useState<boolean>();

    const onRequiredTypeChange = ({ requiredMarkValue }: { requiredMarkValue: RequiredMark }) => {
        setRequiredMarkType(requiredMarkValue);
    };

    return (
        <Form
            className={css.form}
            style={{position: pin ? "relative" : "absolute"}}
            form={form}
            layout="vertical"
            initialValues={{ requiredMarkValue: requiredMark }}
            onValuesChange={onRequiredTypeChange}
            requiredMark={false}>

            <div className={css.formHeader}>
                <span>Filter</span>

                <div className={css.controls}>
                    <Button icon={<PushpinOutlined />} onClick={() => setPin(!pin)}/>
                </div>
            </div>

            <div className={css.formBody}>
                <Form.Item label="Date">
                    <RangePicker />
                </Form.Item>
                <Form.Item label="Officials">
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select officials"
                        onChange={handleChange}
                        options={options}
                    />
                </Form.Item>
                <Form.Item label="Category">
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select categories"
                        onChange={handleChange}
                        options={options}
                    />
                </Form.Item>
                <Form.Item label="Assessment">
                    <Input placeholder="Type assessment from" />
                    <Input placeholder="Type assessment to" />
                </Form.Item>
                <Form.Item label="Comment">
                    <Input placeholder="Type comment" />
                </Form.Item>
            </div>

            <div className={css.formFooter}>
                <Button type="primary">Submit</Button>
            </div>
        </Form>
    );
};

const FANS = [1725807, 38177, 162899, 1137860, 2236576];

const DemoLine = (props: {data: Array<any>}) => {
    const d = props.data.filter((i: any) => i.Category === "Body Composition" && FANS.includes(i.FAN)).map(i => {
            try{
                const dateMomentObject = moment(i["Test Date/Time"].slice(0, 10), "DD/MM/YYYY");
                const dateObject = dateMomentObject.toDate();
                return ({...i, Year: dateObject.toString()})
            }catch (e) {
                console.log(e)
            }
        });

    const config = {
        data: d as any,
        xField: "Year",
        yField: 'Score',
        seriesField: 'official',
        xAxis: {
            type: 'time'
        },
        yAxis: {
            label: {
            }
        }
        // smooth: true
    };

    return <Line {...config} style={{width: "100%"}}/>;
};