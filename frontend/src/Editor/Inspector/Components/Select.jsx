import React, { useRef, useState, useEffect } from 'react';
import Accordion from '@/_ui/Accordion';
import { EventManager } from '../EventManager';
import { renderElement } from '../Utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import List from '@/ToolJetUI/List/List';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CodeHinter } from '@/Editor/CodeBuilder/CodeHinter';
import { resolveReferences } from '@/_helpers/utils';

export function Select({ componentMeta, darkMode, ...restProps }) {
  const {
    layoutPropertyChanged,
    component,
    dataQueries,
    paramUpdated,
    currentState,
    eventsChanged,
    apps,
    allComponents,
    pages,
  } = restProps;

  const constructOptions = () => {
    const labels = resolveReferences(component?.component?.definition?.properties?.display_values?.value, currentState);
    const values = resolveReferences(component?.component?.definition?.properties?.values?.value, currentState);
    const _options = labels?.map((label, index) => ({ label, value: values?.[index] }));
    return _options;
  };
  const _markedAsDefault = resolveReferences(component?.component?.definition?.properties?.value?.value, currentState);
  const isDynamicOptionsEnabled = resolveReferences(
    component?.component?.definition?.properties?.advanced?.value,
    currentState
  );

  const [options, setOptions] = useState(constructOptions());
  const [markedAsDefault, setMarkedAsDefault] = useState(_markedAsDefault);

  const validations = Object.keys(componentMeta.validation || {});
  let properties = [];
  let additionalActions = [];
  let optionsProperties = [];

  for (const [key] of Object.entries(componentMeta?.properties)) {
    if (componentMeta?.properties[key]?.section === 'additionalActions') {
      additionalActions.push(key);
    } else if (componentMeta?.properties[key]?.accordian === 'Options') {
      optionsProperties.push(key);
    } else {
      properties.push(key);
    }
  }
  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    ...draggableStyle,
  });

  const handleDeleteOption = (item) => {
    const _items = options.filter((option) => option.value !== item.value);
    setOptions(_items);
  };

  const handleLabelChange = (label, index) => {
    const _options = options.map((option, i) => {
      if (i === index) {
        return {
          label,
          value: option.value,
        };
      }
      return option;
    });
    setOptions(_options);
    paramUpdated(
      { name: 'display_values' },
      'value',
      _options.map((option) => option.label),
      'properties'
    );
  };

  const handleValueChange = (value, index) => {
    const _options = options.map((option, i) => {
      if (i === index) {
        return {
          label: option.label,
          value,
        };
      }
      return option;
    });
    setOptions(_options);
    paramUpdated(
      { name: 'values' },
      'value',
      _options.map((option) => option.value),
      'properties'
    );
  };

  const handleMarkedAsDefaultChange = (value, index) => {
    const _value = options[index]?.value;
    setMarkedAsDefault(_value);
    paramUpdated({ name: 'value' }, 'value', _value, 'properties');
  };

  const _renderOverlay = (item, index) => {
    return (
      <Popover id="popover-basic" className={`${darkMode && 'dark-theme'}`} style={{ minWidth: '248px' }}>
        <Popover.Body>
          <div className="field mb-2" data-cy={`input-and-label-column-name`}>
            <label data-cy={`label-column-name`} className="form-label">
              {'Option label'}
            </label>
            <CodeHinter
              currentState={currentState}
              initialValue={item.label}
              theme={darkMode ? 'monokai' : 'default'}
              mode="javascript"
              lineNumbers={false}
              //   placeholder={column.name}
              onChange={(value) => handleLabelChange(value, index)}
              //   popOverCallback={(showing) => {
              //     this.setColumnPopoverRootCloseBlocker('name', showing);
              //   }}
            />
          </div>
          <div className="field mb-2" data-cy={`input-and-label-column-name`}>
            <label data-cy={`label-column-name`} className="form-label">
              {'Option value'}
            </label>
            <CodeHinter
              currentState={currentState}
              initialValue={item.value}
              theme={darkMode ? 'monokai' : 'default'}
              mode="javascript"
              lineNumbers={false}
              //   placeholder={column.name}handleValueChange
              onChange={(value) => handleValueChange(value, index)}
            />
          </div>
          <div className="field mb-2" data-cy={`input-and-label-column-name`}>
            <CodeHinter
              currentState={currentState}
              initialValue={markedAsDefault === item.value}
              theme={darkMode ? 'monokai' : 'default'}
              mode="javascript"
              lineNumbers={false}
              component={component}
              type={'toggle'}
              paramLabel={'Mark this as default option'}
              //   placeholder={column.name}
              onChange={(value) => handleMarkedAsDefaultChange(value, index)}
            />
          </div>
        </Popover.Body>
      </Popover>
    );
  };

  const _renderOptions = () => {
    return (
      <List>
        <DragDropContext
          onDragEnd={(result) => {
            this.onDragEnd(result);
          }}
        >
          <Droppable droppableId="droppable">
            {({ innerRef, droppableProps, placeholder }) => (
              <div className="w-100" {...droppableProps} ref={innerRef}>
                {options.map((item, index) => {
                  return (
                    <Draggable key={item.value} draggableId={item.value} index={index}>
                      {(provided, snapshot) => (
                        <div
                          key={index}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <OverlayTrigger
                            trigger="click"
                            placement="left"
                            rootClose
                            overlay={_renderOverlay(item, index)}
                          >
                            <div key={item.value}>
                              <List.Item
                                isDraggable={true}
                                primaryText={item.label}
                                //   data-cy={`column-${resolvedItemName}`}
                                enableActionsMenu
                                onMenuOptionClick={(listItem, menuOptionLabel) => {
                                  if (menuOptionLabel === 'Delete') handleDeleteOption(item);
                                }}
                                darkMode={darkMode}
                                menuActions={[
                                  {
                                    label: 'Delete',
                                    icon: '',
                                  },
                                ]}
                              />
                            </div>
                          </OverlayTrigger>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
    );
  };

  let items = [];

  items.push({
    title: 'Data',
    isOpen: true,
    children: properties
      .filter((property) => !optionsProperties.includes(property))
      ?.map((property) =>
        renderElement(
          component,
          componentMeta,
          paramUpdated,
          dataQueries,
          property,
          'properties',
          currentState,
          allComponents,
          darkMode
        )
      ),
  });

  items.push({
    title: 'Options',
    isOpen: true,
    children: (
      <>
        {renderElement(
          component,
          componentMeta,
          paramUpdated,
          dataQueries,
          'advanced',
          'properties',
          currentState,
          allComponents
        )}
        {isDynamicOptionsEnabled
          ? renderElement(
              component,
              componentMeta,
              paramUpdated,
              dataQueries,
              'schema',
              'properties',
              currentState,
              allComponents
            )
          : _renderOptions()}
        {renderElement(
          component,
          componentMeta,
          paramUpdated,
          dataQueries,
          'loadingState',
          'properties',
          currentState,
          allComponents
        )}
      </>
    ),
  });

  items.push({
    title: 'Events',
    isOpen: true,
    children: (
      <EventManager
        component={component}
        componentMeta={componentMeta}
        currentState={currentState}
        dataQueries={dataQueries}
        components={allComponents}
        eventsChanged={eventsChanged}
        apps={apps}
        darkMode={darkMode}
        pages={pages}
      />
    ),
  });

  items.push({
    title: 'Validation',
    isOpen: true,
    children: validations.map((property) =>
      renderElement(
        component,
        componentMeta,
        paramUpdated,
        dataQueries,
        property,
        'validation',
        currentState,
        allComponents,
        darkMode,
        componentMeta.validation?.[property]?.placeholder
      )
    ),
  });

  items.push({
    title: 'Devices',
    isOpen: true,
    children: (
      <>
        {renderElement(
          component,
          componentMeta,
          layoutPropertyChanged,
          dataQueries,
          'showOnDesktop',
          'others',
          currentState,
          allComponents
        )}
        {renderElement(
          component,
          componentMeta,
          layoutPropertyChanged,
          dataQueries,
          'showOnMobile',
          'others',
          currentState,
          allComponents
        )}
      </>
    ),
  });

  return <Accordion items={items} />;
}
