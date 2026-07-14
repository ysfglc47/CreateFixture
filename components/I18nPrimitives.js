import React from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { useLanguage } from '../src/i18n/LanguageContext';
import { translateRuntimeText } from '../src/i18n/runtimeTranslator';

function translateChildren(children) {
  if (typeof children === 'string') return translateRuntimeText(children);
  if (Array.isArray(children)) return children.map(child => translateChildren(child));
  return children;
}

export function Text({ children, ...props }) {
  useLanguage();
  return <RNText {...props}>{translateChildren(children)}</RNText>;
}

export function TextInput(props) {
  useLanguage();
  const nextProps = props?.placeholder && typeof props.placeholder === 'string'
    ? { ...props, placeholder: translateRuntimeText(props.placeholder) }
    : props;

  return <RNTextInput {...nextProps} />;
}
