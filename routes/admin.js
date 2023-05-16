const AdminBro = require("admin-bro");
const AdminBroExpress = require("admin-bro-expressjs");
const AdminBroMongoose = require("admin-bro-mongoose");
const mongoose = require("mongoose");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Category = require("../models/category");
AdminBro.registerAdapter(AdminBroMongoose);

const express = require("express");
const app = express();

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: "/admin",
  branding: {
    companyName: "PetShop",
    logo: "/images/logo_full.png",
    softwareBrothers: false,
  },
  resources: [
    {
      resource: Product,
      options: {
        parent: {
          name: "Информация о товарах",
          icon: "InventoryManagement",
        },
        properties: {
          description: {
            type: "richtext",
            isVisible: { list: false, filter: true, show: true, edit: true },
          },
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          title: {
            isTitle: true,
          },
          price: {
            type: "number",
          },
          imagePath: {
            isVisible: { list: false, filter: false, show: true, edit: true },
            components: {
              show: AdminBro.bundle(
                "../components/admin-imgPath-component.jsx"
              ),
            },
          },
        },
      },
    },
    {
      resource: User,
      options: {
        parent: {
          name: "Информация о пользователях",
          icon: "User",
        },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          username: {
            isTitle: true,
          },
        },
      },
    },
    {
      resource: Order,
      options: {
        parent: {
          name: "Информация о пользователях",
          icon: "User",
        },
        properties: {
          user: {
            isTitle: true,
          },
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          paymentId: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          address: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          cart: {
            isVisible: { list: false, filter: false, show: true, edit: false },
            components: {
              show: AdminBro.bundle("../components/admin-order-component.jsx"),
            },
          },
          "cart.items": {
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
          "cart.totalQty": {
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
          "cart.totalCost": {
            isVisible: {
              list: false,
              filter: false,
              show: false,
              edit: false,
            },
          },
        },
      },
    },
    {
      resource: Category,
      options: {
        parent: {
          name: "Информация о товарах",
          icon: "User",
        },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          slug: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          title: {
            isTitle: true,
          },
        },
      },
    },
  ],
  locale: {
    language: "ru",
    translations: {
      labels: {
        loginWelcome: "Добро пожаловать",
        navigation: "Навигация",
        pages: "Страницы",
        selectedRecords: "Выбрано ({{selected}})",
        filters: "Фильтры",
        adminVersion: "Admin: {{version}}",
        appVersion: "Администратор: {{version}}",
        loginWelcome: "Добро пожаловать",
        Product: "Продукты",
        Category: "Категории",
        User: "Пользователи",
        Order: "Заказы",
      },
      messages: {
        loginWelcome:
          "это ваша панель администратора, введите свой логин и пароль",
        successfullyBulkDeleted: "удалено {{count}} записей",
        successfullyBulkDeleted_plural: "удалено {{count}} записей",
        successfullyDeleted: "Запись удалена",
        successfullyUpdated: "Запись обновлена",
        thereWereValidationErrors:
          "Обнаружены ошибки валидации, проверьте их ниже",
        forbiddenError:
          "Вы не можете выполнить действие {{actionName}} для {{resourceId}}",
        anyForbiddenError: "Вы не можете выполнить это действие",
        successfullyCreated: "Создана новая запись",
        bulkDeleteError:
          "Произошла ошибка при удалении записей, смотрите консоль для получения дополнительной информации.",
        errorFetchingRecords:
          "Произошла ошибка при получении записей, смотрите консоль для получения дополнительной информации.",
        errorFetchingRecord:
          "Произошла ошибка при получении записи, смотрите консоль для получения дополнительной информации.",
        noRecordsSelected: "Вы не выбрали ни одной записи",
        theseRecordsWillBeRemoved: "Будет удалена следующая запись",
        theseRecordsWillBeRemoved_plural: "Будут удалены следующие записи",
        pickSomeFirstToRemove: "Чтобы удалить записи, сначала выберите их",
        error404Resource: "Ресурс с идентификатором: {{resourceId}} не найден",
        error404Action:
          "Ресурс с идентификатором: {{resourceId}} не имеет действия с именем: {{actionName}}",
        error404Record:
          "Ресурс с идентификатором: {{resourceId}} не имеет записи с идентификатором: {{recordId}}",
        seeConsoleForMore:
          "Смотрите консоль разработчика для получения дополнительной информации...",
        noActionComponent:
          "Вы должны реализовать компонент действия для вашего Действия",
        noRecordsInResource: "В этом ресурсе нет записей",
        noRecords: "Нет записей",
        confirmDelete: "Вы уверены, что хотите удалить этот элемент?",
        welcomeOnBoard_title: "Добро пожаловать на борт!",
        welcomeOnBoard_subtitle:
          "Теперь вы с нами! Мы подготовили несколько советов, чтобы вы начали:",
        loginWelcome:
          "Для AdminBro - лучшей административной структуры для приложений Node.js на основе React.",
        addingResources_title: "Добавление ресурсов",
        addingResources_subtitle: "Как добавить новые ресурсы в боковую панель",
        customizeResources_title: "Настройка ресурсов",
        customizeResources_subtitle:
          "Настройка поведения, добавление свойств и другое...",
        customizeActions_title: "Настройка Действий",
        customizeActions_subtitle:
          "Изменение существующих действий и добавление новых",
        writeOwnComponents_title: "Напишите собственные компоненты",
        writeOwnComponents_subtitle: "Как изменить внешний вид AdminBro",
        customDashboard_title: "Пользовательская панель",
        customDashboard_subtitle:
          "Как изменить этот вид и добавить новые страницы в боковую панель",
        roleBasedAccess_title: "Управление доступом на основе ролей",
        roleBasedAccess_subtitle:
          "Создание пользовательских ролей и разрешений в AdminBro",
        community_title: "Присоединяйтесь к сообществу Slack",
        community_subtitle:
          "Общайтесь с создателями AdminBro и другими пользователями",
        foundBug_title: "Нашли ошибку? Нужны улучшения?",
        foundBug_subtitle: "Создайте проблему в нашем репозитории на GitHub",
        needMoreSolutions_title: "Нужны более продвинутые решения?",
        needMoreSolutions_subtitle:
          "Мы готовы предоставить вам красивый дизайн UX/UI и настраиваемое программное обеспечение на основе AdminBro и не только",
        invalidCredentials: "Неверный адрес электронной почты и/или пароль",
      },
      buttons: {
        login: "Войти",
        save: "Сохранить",
        addNewItem: "Добавить новый элемент",
        filter: "Фильтр",
        applyChanges: "Применить изменения",
        resetFilter: "Собросить фильтр",
        confirmRemovalMany: "Подтвердить удаление записей ({{count}})",
        confirmRemovalMany_plural: "Подтвердить удаление {{count}} записей",
        logout: "Выйти",
        seeTheDocumentation: "См.: <1>документацию</1>",
        createFirstRecord: "создать первую запись",
      },
      actions: {
        new: "Создать",
        edit: "Редактировать",
        show: "Показать",
        delete: "Удалить",
        bulkDelete: "Удалить все",
        list: "Список",
      },
    },
  },
  dashboard: {
    component: AdminBro.bundle("../components/admin-dashboard-component.jsx"),
  },
});

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: process.env.ADMIN_COOKIE_NAME,
  cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
});

module.exports = router;
