import React, { useEffect, useState } from 'react';
import { ToolTip } from '@/_components/ToolTip';
import { resolveReferences } from '@/_helpers/utils';
import { useCurrentState } from '@/_stores/currentStateStore';
import Loader from '@/ToolJetUI/Loader/Loader';
class Switch extends React.Component {
  render() {
    const {
      on,
      onClick,
      onChange,
      disabledState,
      color,
      alignment,
      borderColor,
      setOn,
      styles,
      setExposedVariable,
      fireEvent,
    } = this.props;

    const handleToggleChange = () => {
      setOn(!on);
      setExposedVariable('value', !on);
      fireEvent('onChange');
    };

    const switchStyle = {
      position: 'relative',
      display: 'inline-block',
      width: '28px',
      height: '16px',
      marginRight: '0px',
      paddingRight: '0px',
    };

    const sliderStyle = {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: on ? styles.checkedColor : styles.uncheckedColor,
      transition: 'background-color 0.2s',
      borderRadius: '34px',
      outline: `1px solid ${styles.borderColor}`,
    };

    const circleStyle = {
      position: 'absolute',
      content: '',
      height: '12px',
      width: '12px',
      left: '2px',
      bottom: '2px',
      backgroundColor: styles.handleColor,
      transition: 'transform 0.2s',
      borderRadius: '50%',
      transform: on ? 'translateX(12px)' : 'translateX(0)',
    };

    return (
      <div>
        <>
          <div className="d-flex" style={switchStyle} onClick={handleToggleChange}>
            <input
              type="checkbox"
              style={{
                opacity: 0,
                width: 0,
                height: 0,
                backgroundColor: on ? `${color}` : 'white',
                marginTop: '0px',
                marginLeft: alignment == 'left' && '-2rem',
                border: `1 px solid ${borderColor}`,
              }}
              disabled={disabledState}
              className="form-check-input "
              checked={on}
              onChange={onChange}
              onClick={onClick}
            />

            <span style={sliderStyle}>
              <span style={circleStyle}></span>
            </span>
          </div>
        </>
      </div>
    );
  }
}

export const ToggleSwitch = ({
  height,
  properties,
  styles,
  fireEvent,
  setExposedVariable,
  darkMode,
  dataCy,
  component,
  validate,
}) => {
  const defaultValue = properties.defaultValue ?? false;

  const [on, setOn] = React.useState(Boolean(defaultValue));
  const label = properties.label;
  const currentState = useCurrentState();
  const { loadingState, disabledState, tooltip } = properties;
  const [showValidationError, setShowValidationError] = useState(true);
  const { isValid, validationError } = validate(on);

  const [loading, setLoading] = useState(properties?.loadingState);
  const [disable, setDisable] = useState(disabledState || loadingState);
  const [visibility, setVisibility] = useState(properties.visibility);

  const isMandatory = resolveReferences(component?.definition?.validation?.mandatory?.value, currentState);

  const { toggleSwitchColor, boxShadow, alignment, padding, borderColor } = styles;

  const textColor = darkMode && styles.textColor === '#11181C' ? '#fff' : styles.textColor;
  const [calculatedHeight, setCalculatedHeight] = useState(height);

  function toggleValue(e) {
    const toggled = e.target.checked;
    setExposedVariable('value', toggled);
    fireEvent('onChange');
  }
  useEffect(() => {
    if (padding == 'default') {
      setCalculatedHeight(height + 10);
    }
  }, [padding]);

  // Exposing the initially set false value once on load
  useEffect(() => {
    setExposedVariable('value', defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setOn(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const toggle = () => setOn(!on);

  useEffect(() => {
    disable !== disabledState && setDisable(properties.disabledState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.disabledState]);

  useEffect(() => {
    visibility !== properties.visibility && setVisibility(properties.visibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.visibility]);

  useEffect(() => {
    loading !== loadingState && setLoading(loadingState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState]);

  useEffect(() => {
    setExposedVariable('label', label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  useEffect(() => {
    setExposedVariable('isMandatory', isMandatory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMandatory]);

  useEffect(() => {
    setExposedVariable('isLoading', loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  useEffect(() => {
    setExposedVariable('isVisible', visibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibility]);

  useEffect(() => {
    setExposedVariable('isDisabled', disable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disable]);
  useEffect(() => {
    setExposedVariable('isValid', isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid]);
  useEffect(() => {
    setExposedVariable('setLoading', async function (loading) {
      setLoading(loading);
      setExposedVariable('isLoading', loading);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.loadingState]);

  useEffect(() => {
    setExposedVariable('setVisibility', async function (state) {
      setVisibility(state);
      setExposedVariable('isVisible', state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.visibility]);

  useEffect(() => {
    setExposedVariable('setDisable', async function (disable) {
      setDisable(disable);
      setExposedVariable('isDisabled', disable);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledState]);

  useEffect(() => {
    setExposedVariable('toggle', async function () {
      setExposedVariable('value', !on);
      fireEvent('onChange');
      setOn(!on);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const renderInput = () => (
    <div
      data-disabled={disabledState}
      className={`${alignment === 'right' ? 'flex-row-reverse' : ''}`}
      style={{
        display: visibility ? 'flex' : 'none',
        boxShadow,
        alignItems: 'center',
        gap: '8px ',
        justifyContent: `${loadingState ? 'center' : alignment === 'right' ? 'flex-end' : 'space-between'}`,
        padding: padding === 'default' ? '4px 6px' : '',
        height: calculatedHeight == 30 ? (padding == 'default' ? '30px' : '20px') : calculatedHeight,
      }}
      data-cy={dataCy}
    >
      {loading ? (
        <Loader width="16" />
      ) : (
        <>
          <p
            style={{
              lineHeight: padding == 'none' && '12px',
              color: darkMode && textColor === '#11181C' ? '#ECEDEE' : textColor,
              display: 'block',
              overflow: label?.length > 6 && 'hidden', // Hide any content that overflows the box
              textOverflow: 'ellipsis', // Display ellipsis for overflowed content
              fontWeight: 500,
              fontSize: '14px',
              margin: '0px',
            }}
          >
            {label}
            {isMandatory && !on && <span style={{ color: '#DB4324', marginLeft: '1px' }}>{'*'}</span>}
          </p>

          <Switch
            disabledState={disable}
            on={on}
            onClick={toggle}
            onChange={toggleValue}
            color={toggleSwitchColor}
            alignment={alignment}
            padding={padding}
            validationError={validationError}
            isValid={isValid}
            showValidationError={showValidationError}
            properties={properties}
            setShowValidationError={setShowValidationError}
            borderColor={borderColor}
            setOn={setOn}
            styles={styles}
            setExposedVariable={setExposedVariable}
            fireEvent={fireEvent}
          />
        </>
      )}
    </div>
  );

  return (
    <div
      style={{
        height: calculatedHeight == 30 ? (padding == 'default' ? '30px' : '20px') : calculatedHeight,
        justifyContent: `${loadingState ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start'}`,
      }}
    >
      <>
        {properties?.tooltip?.length > 0 ? (
          <ToolTip message={tooltip}>
            <div>{renderInput()}</div>
          </ToolTip>
        ) : (
          <div>{renderInput()}</div>
        )}
      </>
      {showValidationError && visibility && (
        <div
          className="tj-text-sm"
          data-cy={`${String(component.name).toLowerCase()}-invalid-feedback`}
          style={{ color: '#DB4324' }}
        >
          {showValidationError && validationError}
        </div>
      )}
    </div>
  );
};
