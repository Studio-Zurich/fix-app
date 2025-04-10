import StepContainer from "./step-container";

const UserData = () => {
  return (
    <StepContainer>
      <div>
        <label htmlFor="first-name">Vorname</label>
        <input type="text" id="first-name" name="first-name" required />
      </div>
      <div>
        <label htmlFor="last-name">Nachname</label>
        <input type="text" id="last-name" name="last-name" required />
      </div>
      <div></div>
    </StepContainer>
  );
};

export default UserData;
