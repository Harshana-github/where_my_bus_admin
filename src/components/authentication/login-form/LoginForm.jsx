import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import Button from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import notify from 'devextreme/ui/notify';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useUIStore } from '../../../stores/useUIStore';
import { useTranslation } from 'react-i18next';

import './LoginForm.scss';

export default function LoginForm() {
  const navigate = useNavigate();
  const loginUser = useAuthStore(state => state.loginUser);
  const error = useAuthStore(state => state.error);
  const isLoading = useUIStore(state => state.isLoading);
  const setLoading = useUIStore(state => state.setLoading);

  const language = useUIStore(state => state.language);
  const languages = useUIStore(state => state.languages);
  const setLanguage = useUIStore(state => state.setLanguage);
  const setPageTitle = useUIStore(state => state.setPageTitle);

  const formData = useRef({ email: '', password: '' });
  const { t, i18n } = useTranslation();

  setPageTitle("login");

  const onLanguageChange = useCallback((e) => {
    i18n.changeLanguage(e.itemData.id);
    setLanguage(e.itemData.id);
  }, [i18n]);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { email, password } = formData.current;
    setLoading(true);
    const result = await loginUser({ email, password });
    setLoading(false);

    if (!result.isOk) {
      notify(result.error, 'error', 2000);
      console.log(result);
    } else {
      // Optionally navigate or show success
      // navigate('/dashboard');
    }
  }, [loginUser, setLoading]);

  return (
    <form className={'login-form'} onSubmit={onSubmit}>
      {/* Login Form */}
      <Form formData={formData.current} disabled={isLoading}>
        <Item
          dataField={'email'}
          editorType={'dxTextBox'}
          editorOptions={emailEditorOptions}
        >
          <RequiredRule message={t("Email is required")} />
          <EmailRule message={t("Email is invalid")} />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'password'}
          editorType={'dxTextBox'}
          editorOptions={passwordEditorOptions}
        >
          <RequiredRule message={t("Password is required")} />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'rememberMe'}
          editorType={'dxCheckBox'}
          editorOptions={rememberMeEditorOptions}
        >
          <Label visible={false} />
        </Item>
        <ButtonItem>
          <ButtonOptions
            width={'100%'}
            type={'default'}
            useSubmitBehavior={true}
          >
            <span className="dx-button-text">
              {isLoading
                ? <LoadIndicator width={'24px'} height={'24px'} visible={true} />
                : t('Sign In')}
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
      {/* Language Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, widows: '100%' }}>
        <DropDownButton
          items={languages}
          displayExpr="name"
          keyExpr="id"
          selectedItemKey={language}
          showArrowIcon={true}
          useSelectMode={true}
          stylingMode="text"
          icon="globe"
          onItemClick={onLanguageChange}
          hint={t("Select Language")}
        />
      </div>
    </form>
  );
}

const emailEditorOptions = {
  stylingMode: 'filled',
  placeholder: 'Email',
  mode: 'email'
};

const passwordEditorOptions = {
  stylingMode: 'filled',
  placeholder: 'Password',
  mode: 'password'
};

const rememberMeEditorOptions = {
  text: 'Remember me',
  elementAttr: { class: 'form-text' }
};