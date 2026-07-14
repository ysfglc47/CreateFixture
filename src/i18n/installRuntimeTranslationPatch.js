import React from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { translateRuntimeText } from './runtimeTranslator';

let patched = false;

function translateChildren(children) {
  if (typeof children === 'string') return translateRuntimeText(children);
  if (Array.isArray(children)) return children.map(child => translateChildren(child));
  return children;
}

function translateAlertButtons(buttons) {
  if (!Array.isArray(buttons)) return buttons;
  return buttons.map(button => {
    if (!button || typeof button.text !== 'string') return button;
    return {
      ...button,
      text: translateRuntimeText(button.text),
    };
  });
}

export function installRuntimeTranslationPatch() {
  if (patched) return;
  patched = true;

  const originalCreateElement = React.createElement;
  React.createElement = function patchedCreateElement(type, props, ...children) {
    let nextProps = props;
    let nextChildren = children;

    if (type === Text) {
      nextChildren = children.map(child => translateChildren(child));
    }

    if (type === TextInput && props?.placeholder && typeof props.placeholder === 'string') {
      nextProps = {
        ...props,
        placeholder: translateRuntimeText(props.placeholder),
      };
    }

    return originalCreateElement(type, nextProps, ...nextChildren);
  };

  const originalAlert = Alert.alert;
  Alert.alert = function patchedAlert(title, message, buttons, options, type) {
    return originalAlert(
      translateRuntimeText(title),
      translateRuntimeText(message),
      translateAlertButtons(buttons),
      options,
      type
    );
  };
}

