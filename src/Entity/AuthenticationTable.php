<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * AuthenticationTable
 *
 * @ORM\Table(name="Users.Authentication_Table")
 * @ORM\Entity
 */
class AuthenticationTable
{
    /**
     * @var string
     *
     * @ORM\Column(name="Auth_Token", type="string", length=256, nullable=true)
     */
    private $authToken;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;



    /**
     * Set authToken
     *
     * @param string $authToken
     *
     * @return AuthenticationTable
     */
    public function setAuthToken($authToken)
    {
        $this->authToken = $authToken;

        return $this;
    }

    /**
     * Get authToken
     *
     * @return string
     */
    public function getAuthToken()
    {
        return $this->authToken;
    }

    /**
     * Set user
     *
     * @param \AppEntity\UserTable $user
     *
     * @return AuthenticationTable
     */
    public function setUser(\App\Entity\UserTable $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
