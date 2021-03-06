import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import css from './_InlineSelect.scss';
import { ShpDownArrow } from './Shapes';
import { getPrevItem, getNextItem } from './cycleArray';
import { isKeyUp, isKeyDown, isKeyEnter, isKeyEsc } from './isKey';
import toTitleCase from './titleCase';

export default function InlineSelect (props) {
  const container = useRef(null);
  const inputEl = useRef(null);
  const title = useRef(null);
  const height = useRef();
  const [isOpen, open] = useState(false);
  const [selected, setSelected] = useState(false);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    setSelected(props.defaultItem.value);
  }, []);

  const openSelect = () => {
    open(!isOpen);
    height.current = inputEl.current.offsetHeight;
  };

  const handleBlur = () => {
    setFocused(false);
    open(false);
  };

  const handleKeyDown = (event) => {
    if ([38, 40, 13, 27].includes(event.keyCode)) {
      event.preventDefault();
    }
    if (isOpen === true) {
      if (isKeyUp(event.keyCode)) {
        setActive(getPrevItem(props.items, active));
      } else if (isKeyDown(event.keyCode)) {
        setActive(getNextItem(props.items, active));
      } else if (isKeyEnter(event.keyCode) && active !== -1) {
        setSelected(props.items[active].value);
      } else if (isKeyEsc(event.keyCode)) {
        open(false);
      }
    } else {
      if (isKeyDown(event.keyCode)) {
        open(true);
      }
    }
  };

  const getSelectedLabel = () => {
    const item = props.items.find(item => {
      return item.value === selected;
    });
    if (item === undefined) {
      return props.placeholder;
    }

    return item && item.label ? item.label : toTitleCase(item.value);
  };

  const selectItem = (event) => {
    const { value } = event.target.dataset;
    if (value) {
      setSelected(value);
      setActive(value);
      open(false);
      props.onChange(value);
    }
  };

  const items = props.items.map(function (item, index) {
    const label = item.label ? item.label : toTitleCase(item.value);
    const check = item.value === selected ? '✓' : '';

    return (
      <span className={css.item + ' ' + (props.classes.item || 'oscbco-select-item')} data-is-active={index === active} key={item.value} data-value={item.value}>
        {label} <span>{check}</span>
      </span>
    );
  });

  let isDown = true;
  if (container.current) {
    const rect = container.current.getBoundingClientRect();
    isDown = (window.innerHeight - rect.top + rect.height) > inputEl.current.offsetHeight;
  }

  return (
    <span tabIndex={-1} className={css.inlineSelect + ' ' + (props.classes.select || 'oscbco-select')} ref={container} data-is-focused={focused} data-is-down={isDown} onKeyDown={handleKeyDown} onFocus={() => setFocused(true)} onBlur={() => handleBlur(false)}>
      <span className={css.title + ' ' + (props.classes.title || 'oscbco-select-title')} onClick={openSelect} data-is-open={isOpen} ref={title} >
        {getSelectedLabel()} <span className={css.icon}><ShpDownArrow /></span>
      </span>
      <span className={css.itemContainer + ' ' + (props.classes.itemContainer || 'oscbco-select-item-container')} style={{ height: (isOpen === true ? height.current : '0'), marginTop: (!isDown ? (title.current ? -(title.current.offsetHeight - 1) : 0) : 0) }} onClick={selectItem}>
        <span className={css.items + ' ' + (props.classes.items || 'oscbco-select-items')} ref={inputEl}>
          {items}
        </span>
      </span>
    </span>
  );
}

InlineSelect.defaultProps = {
  classes: {},
  placeholder: 'Select option',
  defaultItem: {},
  items: [],
  onChange: () => {}
};

InlineSelect.propTypes = {
  placeholder: PropTypes.string,
  items: PropTypes.array,
  onChange: PropTypes.func,
  defaultItem: PropTypes.object,
  classes: PropTypes.object
}
