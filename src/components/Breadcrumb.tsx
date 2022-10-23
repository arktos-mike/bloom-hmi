import { EyeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { t } from "i18next";
import { Key } from "react";
import { Link, useLocation } from "react-router-dom";

const Component = () => {
  const location = useLocation();
  const { pathname } = location;
  const pathnames = pathname.split("/").filter((item: any) => item);
  const i18name = (name: string) => {
    switch (name) {
      default:
        return 'menu.' + name;
    }
  }
  return (
    <Breadcrumb separator=">" style={{ margin: '3px 0' }}>
      {(pathnames || []).length > 0 ? (
        <Breadcrumb.Item key="overview">
          <Link to="/"><EyeOutlined /></Link>
        </Breadcrumb.Item>
      ) : (
        <Breadcrumb.Item key="overview"><EyeOutlined /> {t('menu.overview')}</Breadcrumb.Item>
      )}
      {(pathnames || []).map((name: any, index: number) => {
        const routeTo = `/${(pathnames || []).slice(0, index + 1).join("/")}`;
        const isLast = index === (pathnames || []).length - 1;
        return isLast ? (
          <Breadcrumb.Item key={name}>{t(i18name(name))}</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key={name}>
            <Link to={`${routeTo}`}>{t(i18name(name))}</Link>
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}
export default Component;
