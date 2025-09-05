# Domain and Protocol Switcher

## About

A Microsoft Edge extension that allows a user to switch the protocol and domain of the website they are currently viewing.

## Setup

Download the extension folder to your machine. Side load the extension following the [instructions](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading).

Once installed, navigate to the page you wish to create a url switch for. Once there, open the extension. You will see a message saying "No domains added. Please add a domain". Click "Add domain variant for this domain".

A form will appear. The first item in the form is prepopulated with the active domain. Give it a name e.g. Live Environment.

Click "Add Variant". An additional set of fields will appear where you can enter the variant details. The name may be something like "Test Environment". Enter the protocol and domain of the variant.

Multiple variants can be added. For example, live, dev and test.

Click 'Save'.

Now, every time you open this add on when on any of the variant domains, the alternatives will appear as "Switch to" buttons.

## Editing Variants

There is currently a way of editing variants. You will need to delete the variants for the active domain and start again.

## Resetting data

If you come across any unusual behaviour, you can start by resetting all data by pressing the Reset All Data for All Domains button at the bottom of the extension window.
