// Validation register-form
function Validator(options) {
  var selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule, errorElement) {
    var errorMessage;
    var rules = selectorRules[rule.selector];

    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    return !errorMessage;
  }

  // lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var errorElement = inputElement.parentElement.querySelector(
          options.errorSelector,
        );
        var isValid = validate(inputElement, rule, errorElement);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");

          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input,
          ) {
            values[input.name] = input.value;
            return values;
          },
          {});

          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input

      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);
      var errorElement = inputElement.parentElement.querySelector(
        options.errorSelector,
      );

      if (inputElement) {
        // Xử lý trường hợp blur ngoài thẻ input
        inputElement.onblur = function () {
          validate(inputElement, rule, errorElement);
        };

        // Xử lý mỗi khi người dùng nhập
        inputElement.oninput = function () {
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
        };
      }
    });
  }
}

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim()
        ? undefined
        : message || "This field cannot be left blank!";
    },
  };
};

Validator.isPassword = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim()
        ? undefined
        : message || "This field cannot be left blank!";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Email cannot be left blank!";
    },
  };
};

Validator({
  form: "#register-form",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#username", "Username cannot be left blank!"),
    Validator.isRequired("#password", "Password cannot be left blank!"),
    Validator.isRequired("#email", "Email cannot be left blank!"),
    Validator.isEmail("#email", "Email address is not valid!"),
    Validator.isRequired("#phoneNumber", "Phone number cannot be left blank!"),
    Validator.isRequired("#fullName", "Fullname cannot be left blank!"),
  ],
});

Validator({
  form: "#create-customer-form",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#username", "Username cannot be left blank!"),
    Validator.isRequired("#password", "Password cannot be left blank!"),
    Validator.isRequired("#email", "Email cannot be left blank!"),
    Validator.isEmail("#email", "Email address is not valid!"),
    Validator.isRequired("#phoneNumber", "Phone number cannot be left blank!"),
    Validator.isRequired("#fullName", "Fullname cannot be left blank!"),
  ],
});

Validator({
  form: "#create-document-form",
  errorSelector: ".form-message",
  rules: [Validator.isRequired("#title", "Title cannot be left blank!")],
});
