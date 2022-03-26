import modalTypes from './modalTypes';

// Hides a shown Modal

export const hideModal = componentName => ({
  type: modalTypes.HIDE_MODAL,
  payload: componentName
});

// Shows the Modal component with a specified child and props

export const showModal = (props, component) => ({
  type: modalTypes.SHOW_MODAL,
  payload: { props, component }
});
