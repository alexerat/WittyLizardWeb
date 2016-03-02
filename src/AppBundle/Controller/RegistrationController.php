<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use AppBundle\Form\UserType;
use AppBundle\Entity\UserTable;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class RegistrationController extends Controller
{
    /**
     * @Route("/register", name="user_registration")
     */
    public function registerAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager('user_conn');
        $userStyle = $em->find('AppBundle\Entity\StyleGroups', 1);
        $em->persist($userStyle);
        $userLang = $em->find('AppBundle\Entity\LanguageTable', 1);
        $em->persist($userLang);
        $em->flush();
        // 1) build the form
        $user = new UserTable($userStyle, $userLang);
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid())
        {
            // 3) Encode the password (you could also do this via Doctrine listener)
            $password = $this->get('security.password_encoder')
                ->encodePassword($user, $user->getPlainPassword());
            $user->setPassCheck($password);

            // 4) save the User!
            $em->persist($user);
            $em->flush();

            // ... do any other work - like send them an email, etc
            // maybe set a "flash" success message for the user

            return $this->redirectToRoute('user_registration_success');
        }

        return $this->render(
            'registration/register.html.twig',
            array('form' => $form->createView())
        );
    }

    /**
     * @Route("/register_success", name="user_registration_success")
     */
    public function successAction(Request $request)
    {
      return $this->render(
          'registration/register_success.html.twig',
          array()
      );
    }
}
